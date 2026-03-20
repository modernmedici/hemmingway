import SwiftUI

struct EditorView: View {
    let post: Post?
    let defaultColumn: Column
    var onSave: (String, String, Column) -> Void
    var onCancel: () -> Void

    @State private var title: String
    @State private var bodyText: String
    @FocusState private var titleFocused: Bool
    @StateObject private var transcription = TranscriptionService()

    init(post: Post?, defaultColumn: Column,
         onSave: @escaping (String, String, Column) -> Void,
         onCancel: @escaping () -> Void) {
        self.post = post
        self.defaultColumn = defaultColumn
        self.onSave = onSave
        self.onCancel = onCancel
        _title = State(initialValue: post?.title ?? "")
        _bodyText = State(initialValue: post?.body ?? "")
    }

    private var canSave: Bool {
        !title.trimmingCharacters(in: .whitespaces).isEmpty
    }

    private func save() {
        guard canSave else { return }
        onSave(title.trimmingCharacters(in: .whitespaces),
               bodyText.trimmingCharacters(in: .whitespacesAndNewlines),
               defaultColumn)
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack(spacing: 10) {
                Button {
                    if canSave { save() } else { onCancel() }
                } label: {
                    HStack(spacing: 5) {
                        Image(systemName: "chevron.left").font(.system(size: 12))
                        Text("Back to Board").font(.system(size: 12))
                    }
                    .foregroundStyle(.secondary)
                }
                .buttonStyle(.plain)

                Spacer()

                // Mic button
                Button { transcription.toggle() } label: {
                    Image(systemName: transcription.isRecording ? "mic.fill" : "mic")
                        .font(.system(size: 13))
                        .foregroundStyle(transcription.isRecording ? .red : .secondary)
                }
                .buttonStyle(.bordered)
                .controlSize(.small)
                .tint(transcription.isRecording ? .red : nil)
                .help(transcription.isRecording ? "Stop recording" : "Start voice dictation")

                if let err = transcription.error {
                    Text(err)
                        .font(.system(size: 10)).foregroundStyle(.red)
                        .lineLimit(1).frame(maxWidth: 140)
                }

                Button("Save") { save() }
                    .disabled(!canSave)
                    .buttonStyle(.borderedProminent)
                    .controlSize(.small)
                    .keyboardShortcut(.return, modifiers: .command)
            }
            .padding(.horizontal, 40).padding(.vertical, 12)
            .background(.regularMaterial)
            .overlay(alignment: .bottom) { Divider() }

            // Editor
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    TextField("Essay Title", text: $title, axis: .vertical)
                        .font(.custom("Georgia", size: 36).bold())
                        .textFieldStyle(.plain)
                        .lineLimit(1...5)
                        .focused($titleFocused)
                        .padding(.bottom, 28)

                    TextEditor(text: $bodyText)
                        .font(.custom("Georgia", size: 17))
                        .lineSpacing(8)
                        .frame(minHeight: 500)
                        .scrollContentBackground(.hidden)
                        .background(.clear)
                }
                .padding(.horizontal, 32).padding(.vertical, 56)
                .frame(maxWidth: 768).frame(maxWidth: .infinity)
            }

            // Footer
            Divider()
            Text("⌘↵ to save · Esc to go back")
                .font(.system(size: 10)).foregroundStyle(.tertiary)
                .kerning(0.5).padding(.vertical, 10)
        }
        .onAppear {
            titleFocused = true
            Task { await transcription.requestPermissions() }
        }
        .onDisappear { transcription.stop() }
        .onExitCommand { onCancel() }
        .onChange(of: transcription.lastLine) { _, line in
            guard let line else { return }
            bodyText = bodyText.isEmpty ? line : bodyText + " " + line
        }
    }
}
