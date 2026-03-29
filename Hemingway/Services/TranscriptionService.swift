import SwiftUI
import AVFoundation
import WhisperKit
import LLM

@MainActor
final class TranscriptionService: ObservableObject {
    // Published state
    @Published var isRecording = false
    @Published var isProcessing = false
    @Published var lastLine: String?
    @Published var error: String?
    @Published var isModelReady = false
    @Published var modelProgress: Double = 0.0

    // Model state
    private var whisperKit: WhisperKit?
    private var textCleaner: TextCleaner?
    private var audioEngine: AVAudioEngine?
    private var audioBuffer: [Float] = []
    private let bufferLock = NSLock()

    // Task lifecycle
    private var processingTask: Task<Void, Never>?
    private var pendingStart = false

    // Constants
    private let sampleRate: Double = 16000
    private let maxRecordingSeconds: Double = 300 // 5 minutes
    private let minRecordingSeconds: Double = 0.5

    private var modelDir: URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("Hemingway")
            .appendingPathComponent("models")
    }

    func prepare() async {
        // Request microphone permission
        let status = await AVAudioApplication.requestRecordPermission()
        guard status else {
            error = "Microphone access denied"
            return
        }

        // Start model download
        await downloadModels()
    }

    func toggle() {
        if isRecording {
            processingTask = Task {
                await stopAndProcess()
            }
        } else if isModelReady {
            processingTask = Task {
                await startRecording()
            }
        } else {
            // Models not ready, start download and flag for auto-start
            pendingStart = true
            Task {
                await downloadModels()
            }
        }
    }

    func stop() {
        processingTask?.cancel()
        processingTask = nil
        stopRecording()
    }

    // MARK: - Model Management

    private func downloadModels() async {
        guard !isModelReady else { return }

        do {
            try FileManager.default.createDirectory(at: modelDir, withIntermediateDirectories: true)

            // Download WhisperKit model
            modelProgress = 0.1
            let whisperPath = modelDir.appendingPathComponent("openai_whisper-small.en")
            if !isValidWhisperModel(at: whisperPath) {
                try await downloadWhisperModel(to: whisperPath)
            }
            modelProgress = 0.5

            // Download LLM model (upgraded to 2B per review)
            let llmPath = modelDir.appendingPathComponent("Qwen2.5-2B-Instruct-Q4_K_M.gguf")
            if !isValidLLMModel(at: llmPath) {
                try await downloadLLMModel(to: llmPath)
            }
            modelProgress = 0.9

            // Load models
            whisperKit = try await WhisperKit(modelFolder: whisperPath.path)
            textCleaner = TextCleaner(modelPath: llmPath)
            try await textCleaner?.warmup()

            modelProgress = 1.0
            isModelReady = true

            // Auto-start if flagged
            if pendingStart {
                pendingStart = false
                await startRecording()
            }
        } catch {
            self.error = "Model download failed. Check internet."
        }
    }

    private func isValidWhisperModel(at path: URL) -> Bool {
        guard FileManager.default.fileExists(atPath: path.path) else { return false }
        // WhisperKit models are directories with multiple files
        // Just check directory exists and has content
        let contents = try? FileManager.default.contentsOfDirectory(atPath: path.path)
        return (contents?.count ?? 0) > 0
    }

    private func isValidLLMModel(at path: URL) -> Bool {
        guard let attrs = try? FileManager.default.attributesOfItem(atPath: path.path),
              let size = attrs[.size] as? Int64 else {
            return false
        }
        // Expected size ~1.5GB for 2B Q4_K_M, allow ±20%
        let expectedSize: Int64 = 1_500_000_000
        let tolerance: Int64 = expectedSize / 5
        return size > (expectedSize - tolerance) && size < (expectedSize + tolerance)
    }

    private func downloadWhisperModel(to path: URL) async throws {
        // WhisperKit has built-in download via initializer
        // If path doesn't exist, it will download automatically
        // No separate download needed
    }

    private func downloadLLMModel(to path: URL) async throws {
        let url = URL(string: "https://huggingface.co/Qwen/Qwen2.5-2B-Instruct-GGUF/resolve/main/qwen2.5-2b-instruct-q4_k_m.gguf")!

        let (tempURL, _) = try await URLSession.shared.download(from: url)
        try FileManager.default.moveItem(at: tempURL, to: path)
    }

    // MARK: - Recording

    private func startRecording() async {
        guard !isRecording else { return }

        audioBuffer.removeAll()
        audioEngine = AVAudioEngine()

        guard let engine = audioEngine else { return }

        let inputNode = engine.inputNode
        let inputFormat = inputNode.outputFormat(forBus: 0)

        // Configure for 16kHz mono Float32 (WhisperKit required format)
        guard let outputFormat = AVAudioFormat(
            commonFormat: .pcmFormatFloat32,
            sampleRate: sampleRate,
            channels: 1,
            interleaved: false
        ) else {
            error = "Audio format configuration failed"
            return
        }

        guard let converter = AVAudioConverter(from: inputFormat, to: outputFormat) else {
            error = "Audio converter initialization failed"
            return
        }

        inputNode.installTap(onBus: 0, bufferSize: 4096, format: inputFormat) { [weak self] buffer, _ in
            guard let self = self else { return }

            // Convert to 16kHz mono Float32
            guard let convertedBuffer = AVAudioPCMBuffer(
                pcmFormat: outputFormat,
                frameCapacity: AVAudioFrameCount(outputFormat.sampleRate * Double(buffer.frameLength) / buffer.format.sampleRate)
            ) else { return }

            var error: NSError?
            converter.convert(to: convertedBuffer, error: &error) { _, outStatus in
                outStatus.pointee = .haveData
                return buffer
            }

            guard error == nil,
                  let channelData = convertedBuffer.floatChannelData?[0] else { return }

            let samples = Array(UnsafeBufferPointer(start: channelData, count: Int(convertedBuffer.frameLength)))

            self.bufferLock.lock()
            self.audioBuffer.append(contentsOf: samples)
            self.bufferLock.unlock()
        }

        do {
            try engine.start()
            isRecording = true
            error = nil
        } catch {
            self.error = "Microphone unavailable"
        }
    }

    private func stopRecording() {
        audioEngine?.stop()
        audioEngine?.inputNode.removeTap(onBus: 0)
        audioEngine = nil
        isRecording = false
    }

    private func stopAndProcess() async {
        stopRecording()

        // Check for cancellation
        if Task.isCancelled { return }

        isProcessing = true
        defer { isProcessing = false }

        // Get audio buffer
        bufferLock.lock()
        let samples = audioBuffer
        audioBuffer.removeAll()
        bufferLock.unlock()

        // Validate recording length
        let duration = Double(samples.count) / sampleRate
        if duration < minRecordingSeconds {
            error = "Recording too short"
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) { [weak self] in
                self?.error = nil
            }
            return
        }

        if duration > maxRecordingSeconds {
            error = "Recording too long (max 5 min)"
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) { [weak self] in
                self?.error = nil
            }
            return
        }

        // Transcribe with WhisperKit
        guard let whisperKit = whisperKit else {
            error = "Transcription failed"
            return
        }

        let rawText: String
        do {
            let result = try await whisperKit.transcribe(audioArray: samples)
            rawText = result?.text ?? ""
        } catch {
            self.error = "Transcription failed"
            return
        }

        // Check for cancellation after transcription
        if Task.isCancelled { return }

        // Filter hallucinations
        let filtered = filterHallucinations(rawText)
        guard !filtered.isEmpty else {
            // Silent failure - no text to insert
            return
        }

        // Clean with LLM
        let cleanedText: String
        if let textCleaner = textCleaner {
            cleanedText = await textCleaner.clean(filtered)
        } else {
            cleanedText = filtered // Fallback to raw if LLM unavailable
        }

        // Publish result
        lastLine = cleanedText
    }

    private func filterHallucinations(_ text: String) -> String {
        let hallucinations = [
            "[BLANK_AUDIO]",
            "[NO_SPEECH]",
            "[MUSIC]",
            "(blank audio)",
            "[ Silence ]",
            "Thank you for watching.",
            "Please subscribe.",
            "Thanks for watching."
        ]

        var result = text
        for hallucination in hallucinations {
            result = result.replacingOccurrences(of: hallucination, with: "")
        }

        return result.trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
