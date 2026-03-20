import Foundation
import Yams

struct PostSerializer {
    private static let iso8601: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()

    static func decode(from string: String) throws -> Post {
        // Split on "---\n" — frontmatter is between first and second ---
        guard string.hasPrefix("---\n") else { throw SerializerError.invalidFormat }
        let rest = String(string.dropFirst(4))
        guard let range = rest.range(of: "\n---\n") else { throw SerializerError.invalidFormat }

        let frontmatter = String(rest[rest.startIndex..<range.lowerBound])
        let bodyContent = String(rest[range.upperBound...]).trimmingCharacters(in: .newlines)

        let yaml = (try? Yams.load(yaml: frontmatter) as? [String: Any]) ?? [:]
        guard let id = yaml["id"] as? String else { throw SerializerError.missingID }

        let title     = yaml["title"] as? String ?? ""
        let column    = (yaml["column"] as? String).flatMap(Column.init) ?? .ideas
        let createdAt = (yaml["createdAt"] as? String).flatMap(iso8601.date(from:)) ?? Date()
        let updatedAt = (yaml["updatedAt"] as? String).flatMap(iso8601.date(from:)) ?? Date()

        return Post(id: id, title: title, body: bodyContent,
                    column: column, createdAt: createdAt, updatedAt: updatedAt)
    }

    static func encode(_ post: Post) throws -> String {
        func yamlString(_ s: String) -> String {
            // Quote strings containing special YAML characters
            if s.isEmpty || s.contains(":") || s.contains("#") || s.contains("\n") || s.hasPrefix(" ") || s.hasSuffix(" ") {
                let escaped = s.replacingOccurrences(of: "\\", with: "\\\\")
                               .replacingOccurrences(of: "\"", with: "\\\"")
                return "\"\(escaped)\""
            }
            return s
        }
        let yaml = """
            id: \(yamlString(post.id))
            title: \(yamlString(post.title))
            column: \(post.column.rawValue)
            createdAt: \(iso8601.string(from: post.createdAt))
            updatedAt: \(iso8601.string(from: post.updatedAt))
            """
        return "---\n\(yaml)\n---\n\(post.body)\n"
    }

    enum SerializerError: Error {
        case invalidFormat, missingID
    }
}
