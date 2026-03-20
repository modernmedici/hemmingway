#!/usr/bin/env swift
// Hemingway voice transcription — uses Apple SFSpeechRecognizer (on-device)
// Streams completed sentences as {"text": "..."} JSON lines to stdout.
// Runs until SIGTERM.

import Foundation
import Speech
import AVFoundation

// ── JSON output ──────────────────────────────────────────────────────────────

func emit(_ text: String) {
    let obj: [String: String] = ["text": text]
    if let data = try? JSONSerialization.data(withJSONObject: obj),
       let line = String(data: data, encoding: .utf8) {
        print(line)
        fflush(stdout)
    }
}

// ── Transcriber ──────────────────────────────────────────────────────────────

class Transcriber {
    let engine = AVAudioEngine()
    let recognizer: SFSpeechRecognizer
    var request: SFSpeechAudioBufferRecognitionRequest?
    var task: SFSpeechRecognitionTask?

    init() {
        guard let rec = SFSpeechRecognizer(locale: Locale(identifier: "en-US")) else {
            fputs("error: SFSpeechRecognizer unavailable\n", stderr)
            exit(1)
        }
        rec.defaultTaskHint = .dictation
        self.recognizer = rec
    }

    func start() {
        let inputNode = engine.inputNode
        let format = inputNode.outputFormat(forBus: 0)

        startTask(format: format, inputNode: inputNode)

        inputNode.installTap(onBus: 0, bufferSize: 4096, format: format) { [weak self] buffer, _ in
            self?.request?.append(buffer)
        }

        engine.prepare()
        do {
            try engine.start()
        } catch {
            fputs("error: AVAudioEngine failed: \(error)\n", stderr)
            exit(1)
        }
    }

    private func startTask(format: AVAudioFormat, inputNode: AVAudioInputNode) {
        let req = SFSpeechAudioBufferRecognitionRequest()
        req.requiresOnDeviceRecognition = true
        req.shouldReportPartialResults = false
        self.request = req

        self.task = recognizer.recognitionTask(with: req) { [weak self] result, error in
            guard let self else { return }

            if let result, result.isFinal {
                let text = result.bestTranscription.formattedString.trimmingCharacters(in: .whitespaces)
                if !text.isEmpty {
                    emit(text)
                }
                // Restart for next utterance
                self.startTask(format: format, inputNode: inputNode)
            } else if let error = error as NSError? {
                // 1110 = no speech detected / timeout — restart silently
                if error.code != 1110 {
                    fputs("recognition error \(error.code): \(error.localizedDescription)\n", stderr)
                }
                self.startTask(format: format, inputNode: inputNode)
            }
        }
    }

    func stop() {
        task?.cancel()
        request?.endAudio()
        engine.stop()
        engine.inputNode.removeTap(onBus: 0)
    }
}

// ── Permissions ───────────────────────────────────────────────────────────────

func requestPermissions(completion: @escaping (Bool) -> Void) {
    SFSpeechRecognizer.requestAuthorization { status in
        guard status == .authorized else {
            fputs("error: speech recognition not authorized (\(status.rawValue))\n", stderr)
            completion(false)
            return
        }
        AVCaptureDevice.requestAccess(for: .audio) { granted in
            completion(granted)
        }
    }
}

// ── Main ──────────────────────────────────────────────────────────────────────

let transcriber = Transcriber()

// Handle SIGTERM gracefully
signal(SIGTERM) { _ in
    transcriber.stop()
    exit(0)
}
signal(SIGINT) { _ in
    transcriber.stop()
    exit(0)
}

requestPermissions { granted in
    guard granted else {
        fputs("error: microphone access denied\n", stderr)
        exit(1)
    }
    transcriber.start()
}

RunLoop.main.run()
