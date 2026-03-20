import SwiftUI

struct BoardView: View {
    @EnvironmentObject var store: PostStore
    var onNewPost: (Column) -> Void
    var onEditPost: (Post) -> Void

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 0) {
                Text("Hemingway")
                    .font(.custom("Georgia", size: 22).italic())
                    .padding(.leading, 24)
                Spacer()
                Button { onNewPost(.ideas) } label: {
                    Label("New Idea", systemImage: "plus")
                        .font(.system(size: 13, weight: .medium))
                }
                .buttonStyle(.bordered)
                .padding(.trailing, 24)
            }
            .frame(height: 52)
            .background(.background)
            .overlay(alignment: .bottom) { Divider() }

            HStack(alignment: .top, spacing: 0) {
                ForEach(Column.allCases, id: \.self) { column in
                    ColumnView(
                        column: column,
                        posts: store.posts.filter { $0.column == column },
                        onNewPost: { onNewPost(column) },
                        onEditPost: onEditPost,
                        onMove: { post, to in store.move(post, to: to) },
                        onDelete: { store.delete($0) }
                    )
                    if column != Column.allCases.last {
                        Divider()
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .frame(minWidth: 900, minHeight: 600)
    }
}
