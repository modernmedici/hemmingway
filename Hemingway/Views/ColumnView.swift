import SwiftUI

struct ColumnView: View {
    let column: Column
    let posts: [Post]
    var onNewPost: () -> Void
    var onEditPost: (Post) -> Void
    var onMove: (Post, Column) -> Void
    var onDelete: (Post) -> Void

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text(column.label)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)
                    .kerning(0.5)
                if !posts.isEmpty {
                    Text("\(posts.count)")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(.tertiary)
                        .padding(.horizontal, 6).padding(.vertical, 2)
                        .background(.quaternary, in: Capsule())
                }
                Spacer()
                Button { onNewPost() } label: {
                    Image(systemName: "plus").font(.system(size: 12))
                }
                .buttonStyle(.plain)
                .foregroundStyle(.secondary)
            }
            .padding(.horizontal, 20).padding(.vertical, 14)

            Divider()

            ScrollView {
                LazyVStack(spacing: 10) {
                    if posts.isEmpty {
                        Text("Empty")
                            .font(.system(size: 13)).foregroundStyle(.quaternary)
                            .frame(maxWidth: .infinity).padding(.top, 40)
                    } else {
                        ForEach(posts) { post in
                            PostCardView(
                                post: post,
                                onEdit: { onEditPost(post) },
                                onMove: { onMove(post, $0) },
                                onDelete: { onDelete(post) }
                            )
                        }
                    }
                }
                .padding(16)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
