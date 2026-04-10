import XCTest
@testable import Hemingway

final class TextCleanerTests: XCTestCase {
    var sut: TextCleaner!
    var tempModelPath: URL!

    override func setUp() async throws {
        // Create temp model path for testing
        tempModelPath = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString)
            .appendingPathExtension("gguf")

        sut = TextCleaner(modelPath: tempModelPath)
    }

    override func tearDown() {
        try? FileManager.default.removeItem(at: tempModelPath)
        sut = nil
        tempModelPath = nil
    }

    // MARK: - Cleanup Tests

    func testClean_RemovesFillerWords() async {
        // This test requires a real LLM model to be loaded
        throw XCTSkip("Requires real LLM model (~1.5GB download)")

        // Given: Text with filler words
        let input = "um so basically I was thinking you know that we should uh write more"

        // When: clean() is called
        let result = await sut.clean(input)

        // Then: Filler words should be removed
        XCTAssertFalse(result.contains("um"))
        XCTAssertFalse(result.contains("so"))
        XCTAssertFalse(result.contains("basically"))
        XCTAssertFalse(result.contains("you know"))
        XCTAssertFalse(result.contains("uh"))
        XCTAssertTrue(result.contains("thinking"))
        XCTAssertTrue(result.contains("write more"))
    }

    func testClean_FixesPunctuation() async {
        throw XCTSkip("Requires real LLM model")

        // Given: Text with poor punctuation
        let input = "i was thinking that we should write more lets do it"

        // When: clean() is called
        let result = await sut.clean(input)

        // Then: Should have proper capitalization and punctuation
        XCTAssertTrue(result.first?.isUppercase ?? false, "Should start with capital letter")
        XCTAssertTrue(result.hasSuffix(".") || result.hasSuffix("!") || result.hasSuffix("?"),
                      "Should end with punctuation")
    }

    func testClean_Timeout_ReturnsRaw() async {
        // Given: TextCleaner with no model loaded (will timeout/fail)
        let input = "test text"

        // When: clean() is called
        let result = await sut.clean(input)

        // Then: Should return raw text on failure
        XCTAssertEqual(result, input, "Should return raw text when LLM unavailable")
    }

    func testClean_EmptyOutput_ReturnsRaw() async {
        // This would require mocking LLM to return empty string
        throw XCTSkip("Requires LLM mocking infrastructure")

        // Given: Text that LLM returns empty for
        let input = "test text"

        // When: clean() returns empty
        // Then: Should return raw text
        let result = await sut.clean(input)
        XCTAssertEqual(result, input)
    }

    func testClean_GarbageOutput_ReturnsRaw() async {
        // This would require mocking LLM to return 3x+ length garbage
        throw XCTSkip("Requires LLM mocking infrastructure")

        // Given: Input text
        let input = "short text"

        // When: LLM returns garbage (>3x length)
        // Then: Should return raw text
        let result = await sut.clean(input)
        XCTAssertEqual(result, input)
    }
}
