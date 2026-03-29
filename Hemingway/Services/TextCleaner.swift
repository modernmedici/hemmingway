import Foundation
import LLM

actor TextCleaner {
    private var llm: LLM?
    private let modelPath: URL
    private let timeoutSeconds: TimeInterval = 15

    init(modelPath: URL) {
        self.modelPath = modelPath
    }

    func warmup() async throws {
        guard llm == nil else { return }
        llm = try LLM(from: modelPath)
    }

    func clean(_ rawText: String) async -> String {
        guard !rawText.isEmpty else { return rawText }

        // Ensure LLM is loaded
        if llm == nil {
            do {
                try await warmup()
            } catch {
                return rawText // Fallback to raw on load failure
            }
        }

        guard let llm = llm else { return rawText }

        let systemPrompt = """
You are a transcription cleanup assistant. Your ONLY job is to clean up voice-transcribed text.

Rules:
1. Remove filler words: um, uh, like, you know, so, basically, actually, I mean
2. Fix punctuation and capitalization for proper sentences
3. Remove false starts and repeated phrases (e.g., "I was I was going" → "I was going")
4. Do NOT add content, change meaning, or editorialize
5. Do NOT wrap output in quotes or add commentary
6. Return ONLY the cleaned text
"""

        let userPrompt = rawText

        // Run LLM with timeout
        let cleanedText: String
        do {
            cleanedText = try await withTimeout(seconds: timeoutSeconds) {
                try await llm.respond(to: userPrompt, systemPrompt: systemPrompt)
            }
        } catch {
            return rawText // Fallback to raw on timeout or error
        }

        // Garbage detection
        guard !cleanedText.isEmpty else { return rawText }
        if cleanedText.count > rawText.count * 3 {
            return rawText // LLM hallucinated, use raw
        }

        // Sentence splitting with paragraph breaks
        return formatWithParagraphs(cleanedText)
    }

    private func formatWithParagraphs(_ text: String) -> String {
        // Split on sentence boundaries
        let sentences = text.split(whereSeparator: { char in
            char == "." || char == "!" || char == "?"
        }).map { $0.trimmingCharacters(in: .whitespaces) }

        guard !sentences.isEmpty else { return text }

        var result = ""
        for (index, sentence) in sentences.enumerated() {
            result += sentence

            // Add period if original ended with punctuation
            let needsPunctuation = !sentence.isEmpty && ![".", "!", "?"].contains(String(sentence.last!))
            if needsPunctuation {
                result += "."
            }

            // Add paragraph break every 2-3 sentences
            let isLastSentence = index == sentences.count - 1
            if !isLastSentence {
                let sentencesInCurrentPara = (index + 1) % 3
                if sentencesInCurrentPara == 0 {
                    result += "\n\n"
                } else {
                    result += " "
                }
            }
        }

        return result
    }

    private func withTimeout<T>(seconds: TimeInterval, operation: @escaping () async throws -> T) async throws -> T {
        try await withThrowingTaskGroup(of: T.self) { group in
            group.addTask {
                try await operation()
            }

            group.addTask {
                try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
                throw TimeoutError()
            }

            let result = try await group.next()!
            group.cancelAll()
            return result
        }
    }

    private struct TimeoutError: Error {}
}
