import Foundation

@MainActor
final class PostStore: ObservableObject {
    @Published var posts: [Post] = []
    @Published var isLoading = true

    private let postsDir: URL = FileManager.default
        .homeDirectoryForCurrentUser
        .appendingPathComponent("Desktop/Hemingway")

    init() {
        Task { await load() }
    }

    private func ensureDir() throws {
        try FileManager.default.createDirectory(
            at: postsDir, withIntermediateDirectories: true)
    }

    func load() async {
        do {
            try ensureDir()
            let urls = try FileManager.default
                .contentsOfDirectory(at: postsDir, includingPropertiesForKeys: nil)
                .filter { $0.pathExtension == "md" }
            var loaded: [Post] = []
            for url in urls {
                let content = try String(contentsOf: url, encoding: .utf8)
                if let post = try? PostSerializer.decode(from: content) {
                    loaded.append(post)
                }
            }
            posts = loaded.sorted { $0.updatedAt > $1.updatedAt }
        } catch {
            print("[PostStore] Load error:", error)
        }
        isLoading = false
    }

    private func save(_ post: Post) throws {
        let content = try PostSerializer.encode(post)
        let url = postsDir.appendingPathComponent("\(post.id).md")
        try content.write(to: url, atomically: true, encoding: .utf8)
    }

    func create(title: String, body: String, column: Column = .ideas) {
        var post = Post.new(column: column)
        post.title = title
        post.body  = body
        do {
            try ensureDir()
            try save(post)
            posts.insert(post, at: 0)
        } catch { print("[PostStore] Create error:", error) }
    }

    func update(_ post: Post, title: String, body: String) {
        var updated = post
        updated.title     = title
        updated.body      = body
        updated.updatedAt = Date()
        apply(updated)
    }

    func move(_ post: Post, to column: Column) {
        var updated = post
        updated.column    = column
        updated.updatedAt = Date()
        apply(updated)
    }

    func delete(_ post: Post) {
        let url = postsDir.appendingPathComponent("\(post.id).md")
        try? FileManager.default.removeItem(at: url)
        posts.removeAll { $0.id == post.id }
    }

    private func apply(_ post: Post) {
        do { try save(post) } catch { print("[PostStore] Save error:", error) }
        if let idx = posts.firstIndex(where: { $0.id == post.id }) {
            posts[idx] = post
        }
    }
}
