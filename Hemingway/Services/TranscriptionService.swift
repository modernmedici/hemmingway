import Foundation

@MainActor
final class TranscriptionService: ObservableObject {
    @Published var isRecording = false
    @Published var lastLine: String? = nil
    @Published var error: String? = nil

    func requestPermissions() async {}
    func start() async {}
    func stop() {}
    func toggle() {
        if isRecording { stop() } else { Task { await start() } }
    }
}
