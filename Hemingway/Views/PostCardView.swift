import SwiftUI

struct PostCardView: View {
    let post: Post
    var onEdit: () -> Void
    var onMove: (Column) -> Void
    var onDelete: () -> Void

    @State private var isHovered = false
    @State private var confirmDelete = false

    private var wordCount: Int {
        (post.title + " " + post.body)
            .split(separator: " ").count
    }

    private static let relativeDateFormatter: RelativeDateTimeFormatter = {
        let f = RelativeDateTimeFormatter()
        f.unitsStyle = .abbreviated
        return f
    }()

    private var relativeDate: String {
        Self.relativeDateFormatter.localizedString(for: post.updatedAt, relativeTo: Date())
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .top) {
                Text("\(wordCount)w")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(.tertiary)
                    .padding(.horizontal, 6).padding(.vertical, 2)
                    .background(.quaternary, in: Capsule())
                Spacer()
                if isHovered {
                    Menu {
                        ForEach(post.column.others, id: \.self) { col in
                            Button("Move to \(col.label)") { onMove(col) }
                        }
                        Divider()
                        if confirmDelete {
                            Button("Confirm Delete", role: .destructive) { onDelete() }
                            Button("Cancel") { confirmDelete = false }
                        } else {
                            Button("Delete", role: .destructive) { confirmDelete = true }
                        }
                    } label: {
                        Image(systemName: "ellipsis").font(.system(size: 12))
                    }
                    .menuStyle(.borderlessButton)
                    .fixedSize()
                    .buttonStyle(.plain)
                }
            }

            if !post.title.isEmpty {
                Text(post.title)
                    .font(.custom("Georgia", size: 14).bold())
                    .lineLimit(3)
            }

            if !post.body.isEmpty {
                Text(post.body)
                    .font(.system(size: 12)).foregroundStyle(.secondary)
                    .lineLimit(3)
            }

            HStack {
                Text(relativeDate).font(.system(size: 11)).foregroundStyle(.tertiary)
                Spacer()
                Image(systemName: "doc.text").font(.system(size: 11)).foregroundStyle(.quaternary)
            }
        }
        .padding(14)
        .background(.background)
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .shadow(color: .black.opacity(isHovered ? 0.08 : 0.03),
                radius: isHovered ? 6 : 2, y: 2)
        .onHover { isHovered = $0 }
        .onTapGesture { onEdit() }
        .onChange(of: isHovered) { _, hovered in if !hovered { confirmDelete = false } }
    }
}
