import SwiftUI

struct ContentView: View {
    @EnvironmentObject var store: PostStore
    @State private var showEditor = false
    @State private var editingPost: Post? = nil
    @State private var pendingColumn: Column = .ideas

    var body: some View {
        Group {
            if showEditor {
                EditorView(
                    post: editingPost,
                    defaultColumn: pendingColumn,
                    onSave: { title, body, col in
                        if let existing = editingPost {
                            store.update(existing, title: title, body: body, column: col)
                        } else {
                            store.create(title: title, body: body, column: col)
                        }
                        showEditor = false
                    },
                    onCancel: { showEditor = false }
                )
            } else {
                BoardView(
                    onNewPost: { col in
                        editingPost = nil
                        pendingColumn = col
                        showEditor = true
                    },
                    onEditPost: { post in
                        editingPost = post
                        pendingColumn = post.column
                        showEditor = true
                    }
                )
            }
        }
        .animation(.easeInOut(duration: 0.15), value: showEditor)
    }
}
