import Foundation
import Speech
import AVFoundation

@MainActor
final class TranscriptionService: ObservableObject {
    @Published var isRecording = false
    @Published var lastLine: String? = nil
    @Published var error: String? = nil

    private let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private var audioEngine: AVAudioEngine?
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?
    private var lastPartial = ""

    func requestPermissions() async {
        await withCheckedContinuation { cont in
            SFSpeechRecognizer.requestAuthorization { _ in cont.resume() }
        }
        if #available(macOS 14.0, *) {
            _ = await AVAudioApplication.requestRecordPermission()
        }
    }

    func start() async {
        guard !isRecording else { return }
        error = nil
        lastPartial = ""
        lastLine = nil

        guard let recognizer, recognizer.isAvailable else {
            error = "Speech recognition unavailable"
            return
        }
        guard SFSpeechRecognizer.authorizationStatus() == .authorized else {
            error = "Speech recognition not authorized"
            return
        }

        let engine = AVAudioEngine()
        let req = SFSpeechAudioBufferRecognitionRequest()
        req.requiresOnDeviceRecognition = true
        req.shouldReportPartialResults = true

        let input = engine.inputNode
        let fmt = input.outputFormat(forBus: 0)
        input.installTap(onBus: 0, bufferSize: 1024, format: fmt) { [weak req] buffer, _ in
            req?.append(buffer)
        }

        engine.prepare()
        do {
            try engine.start()
        } catch {
            self.error = "Microphone unavailable"
            return
        }

        task = recognizer.recognitionTask(with: req) { [weak self] result, err in
            guard let self else { return }
            if let result {
                Task { @MainActor in
                    let text = result.bestTranscription.formattedString
                    if result.isFinal {
                        if !text.isEmpty, text != self.lastPartial {
                            self.lastLine = text
                        }
                        self.lastPartial = ""
                    } else {
                        self.lastPartial = text
                    }
                }
            }
            if err != nil { Task { @MainActor in self.stop() } }
        }

        audioEngine = engine
        request = req
        isRecording = true
    }

    func stop() {
        audioEngine?.inputNode.removeTap(onBus: 0)
        audioEngine?.stop()
        request?.endAudio()
        task?.cancel()
        audioEngine = nil
        request = nil
        task = nil
        lastPartial = ""
        isRecording = false
    }

    func toggle() {
        if isRecording { stop() } else { Task { await start() } }
    }
}
