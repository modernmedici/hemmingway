import Foundation

enum Column: String, CaseIterable, Codable {
    case ideas     = "ideas"
    case drafts    = "drafts"
    case finalized = "finalized"

    var label: String {
        switch self {
        case .ideas:     return "Scratchpad"
        case .drafts:    return "Drafts"
        case .finalized: return "Published"
        }
    }

    var others: [Column] {
        Column.allCases.filter { $0 != self }
    }
}

struct Post: Identifiable, Equatable {
    var id: String
    var title: String
    var body: String
    var column: Column
    var createdAt: Date
    var updatedAt: Date

    static func new(column: Column = .ideas) -> Post {
        let now = Date()
        let id = String(Int(now.timeIntervalSince1970 * 1000), radix: 36) +
                 String(Int.random(in: 0..<1296), radix: 36)
        return Post(id: id, title: "", body: "", column: column,
                    createdAt: now, updatedAt: now)
    }
}
