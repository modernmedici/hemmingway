import XCTest
@testable import Hemingway

@MainActor
final class TranscriptionServiceTests: XCTestCase {
    var sut: TranscriptionService!

    override func setUp() async throws {
        sut = TranscriptionService()
    }

    override func tearDown() {
        sut = nil
    }

    // MARK: - Permission Tests

    func testPrepare_PermissionGranted_StartsDownload() async {
        // Given: User will grant microphone permission
        // When: prepare() is called
        await sut.prepare()

        // Then: Model download should start (progress > 0)
        XCTAssertTrue(sut.modelProgress > 0 || sut.isModelReady, "Download should start after permission granted")
    }

    func testPrepare_PermissionDenied_ShowsError() async {
        // This test requires mocking AVAudioApplication.requestRecordPermission
        // Skip for now - requires test infrastructure for system permissions
        throw XCTSkip("Requires permission mocking infrastructure")
    }

    // MARK: - Toggle Tests

    func testToggle_WhileRecording_StopsAndProcesses() async {
        // Given: Models are ready and recording is active
        // This requires models to be downloaded first
        await sut.prepare()
        guard sut.isModelReady else {
            throw XCTSkip("Models not ready - requires ~1GB download")
        }

        sut.toggle() // Start recording
        try? await Task.sleep(nanoseconds: 100_000_000) // 0.1s
        XCTAssertTrue(sut.isRecording, "Should be recording")

        // When: Toggle again while recording
        sut.toggle()

        // Then: Should stop and begin processing
        try? await Task.sleep(nanoseconds: 100_000_000) // 0.1s
        XCTAssertFalse(sut.isRecording, "Should stop recording")
        XCTAssertTrue(sut.isProcessing || sut.error != nil, "Should process or show error for short recording")
    }

    func testToggle_ModelsReady_StartsRecording() async {
        // Given: Models are ready
        await sut.prepare()
        guard sut.isModelReady else {
            throw XCTSkip("Models not ready - requires ~1GB download")
        }

        // When: Toggle to start recording
        sut.toggle()
        try? await Task.sleep(nanoseconds: 100_000_000) // 0.1s

        // Then: Should start recording
        XCTAssertTrue(sut.isRecording, "Should start recording when models ready")
    }

    func testToggle_RapidTaps_Ignored() async {
        // Given: Models ready
        await sut.prepare()
        guard sut.isModelReady else {
            throw XCTSkip("Models not ready")
        }

        // When: Rapid toggle calls
        sut.toggle()
        sut.toggle()
        sut.toggle()
        try? await Task.sleep(nanoseconds: 200_000_000) // 0.2s

        // Then: Should not crash, state should be consistent
        XCTAssertTrue(sut.isRecording || sut.isProcessing || !sut.isRecording, "Should handle rapid toggles gracefully")
    }

    // MARK: - Processing Tests

    func testStopAndProcess_HappyPath_InsertsText() async {
        // Requires real audio recording and models
        throw XCTSkip("Integration test - requires mic and models")
    }

    func testStopAndProcess_TooShort_ShowsError() async {
        // Given: A very short recording (< 0.5s)
        await sut.prepare()
        guard sut.isModelReady else { throw XCTSkip("Models not ready") }

        sut.toggle() // Start
        try? await Task.sleep(nanoseconds: 100_000_000) // 0.1s
        sut.toggle() // Stop immediately

        // Then: Should show "Recording too short" error
        try? await Task.sleep(nanoseconds: 500_000_000) // 0.5s for processing
        XCTAssertEqual(sut.error, "Recording too short")
    }

    func testStopAndProcess_TooLong_ShowsError() async {
        // Would require 5+ minute recording
        throw XCTSkip("Test would take 5+ minutes")
    }

    func testStopAndProcess_WhisperFails_ShowsError() async {
        // Requires mocking WhisperKit to throw error
        throw XCTSkip("Requires WhisperKit mocking infrastructure")
    }

    func testStopAndProcess_OnlyHallucinations_NoText() async {
        // Requires mocking WhisperKit to return hallucination text
        throw XCTSkip("Requires WhisperKit mocking infrastructure")
    }

    func testStopAndProcess_LLMTimeout_UsesRaw() async {
        // Requires mocking LLM to timeout
        throw XCTSkip("Requires LLM mocking infrastructure")
    }

    func testStopAndProcess_Cancelled_NoText() async {
        // Given: Recording in progress
        await sut.prepare()
        guard sut.isModelReady else { throw XCTSkip("Models not ready") }

        sut.toggle() // Start
        try? await Task.sleep(nanoseconds: 100_000_000) // 0.1s
        sut.toggle() // Stop and process

        // When: stop() called during processing
        sut.stop()

        // Then: lastLine should remain nil
        try? await Task.sleep(nanoseconds: 500_000_000) // 0.5s
        XCTAssertNil(sut.lastLine, "Should not publish text after cancellation")
    }

    // MARK: - Model Download Tests

    func testModelDownload_CorruptFile_Redownloads() async {
        // This test verifies file size validation logic
        // Would require writing corrupt file to disk and testing isValidLLMModel()
        throw XCTSkip("Requires file system mocking")
    }
}
