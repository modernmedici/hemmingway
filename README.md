# Hemingway (Swift/macOS)

Native macOS writing app with on-device AI voice transcription. Kanban-style workflow: Ideas → Drafts → Published.

> **Note:** This is the Swift rewrite. For the Electron version, see the `main` branch.

---

## Features

- **Three-stage workflow** — Scratchpad → Drafts → Published
- **AI voice dictation** — WhisperKit transcription + LLM text cleanup (100% on-device)
- **Distraction-free editor** — Georgia serif font, keyboard shortcuts
- **File-based storage** — Posts saved as markdown files in `~/Desktop/Hemingway/`
- **Native macOS** — SwiftUI app with zero Electron overhead

## Voice Dictation

Tap the mic button in the editor:

1. **Record** — Speak your thoughts (up to 5 minutes)
2. **Stop** — Tap mic again to finish recording
3. **Process** — WhisperKit transcribes, LLM cleans up filler words and punctuation (~8-19s for typical 20-40s recordings)
4. **Insert** — Cleaned text appears in your draft

**First run:** Downloads ~2GB of models (WhisperKit + Qwen 2.5-2B). Cached locally for instant subsequent use.

---

## Requirements

⚠️ **Xcode 16.0 or later is required** to build this app.

- **macOS:** 14.0+ (Sonoma or later)
- **Xcode:** 16.0+ (includes Swift 6.0 tooling)
- **Why:** WhisperKit 0.16+ requires Swift 6.0 compiler
- **Download:** https://developer.apple.com/download/

---

## Quick Start

### Option 1: Download DMG (coming soon)

Once built, the DMG will be available in GitHub Releases.

### Option 2: Build from source

```bash
# Clone the repo
git clone https://github.com/modernmedici/hemmingway.git
cd hemmingway/.worktrees/swift-app

# Install xcodegen
brew install xcodegen

# Build DMG
./build-dmg.sh
```

The DMG will be created at `./build/Hemingway-YYYYMMDD.dmg`.

For detailed build instructions, see **[BUILD.md](BUILD.md)**.

---

## Tech Stack

- **SwiftUI** — Native macOS UI framework
- **WhisperKit** — On-device speech transcription (Whisper small.en, ~500MB)
- **LLM.swift** — On-device text cleanup via Qwen 2.5-2B (~1.5GB)
- **Yams** — YAML frontmatter parsing for markdown files
- **AVFoundation** — Audio recording and format conversion

All AI processing happens on-device. No data leaves your machine.

---

## Project Structure

```
Hemingway/
├── Models/
│   └── Post.swift              # Post model (title, body, status, timestamps)
├── Views/
│   ├── BoardView.swift         # Three-column kanban board
│   ├── ColumnView.swift        # Single column with cards
│   ├── PostCardView.swift      # Individual post card
│   ├── EditorView.swift        # Full-screen distraction-free editor
│   └── ContentView.swift       # Main navigation (board vs editor)
├── Services/
│   ├── PostStore.swift         # CRUD + file persistence
│   ├── PostSerializer.swift    # Markdown + YAML frontmatter
│   ├── TranscriptionService.swift  # WhisperKit + LLM pipeline
│   └── TextCleaner.swift       # LLM-based text cleanup (actor)
└── HemingwayApp.swift          # App entry point

HemingwayTests/
├── TranscriptionServiceTests.swift  # 13 test cases
└── TextCleanerTests.swift           # 5 test cases
```

---

## Usage

| Action | How |
|---|---|
| Create a post | Click a column header "+" button |
| Edit a post | Click any card |
| Save | Click **Save** or press `⌘↵` |
| Cancel | Press `Esc` or click **Back to Board** |
| Voice dictate | Tap mic button in editor, speak, tap again to stop |
| Move a post | Drag card to another column |
| Delete a post | Right-click card → Delete |
| Create a post | Click **+ New Idea** in the sidebar |
| Edit a post | Click any card |
| Save | Click **Save** or press `⌘↵` |
| Cancel | Press `Esc` or click **Back to Board** |
| Move a post | Open the three-dot menu on the card |
| Delete a post | Three-dot menu → Delete (confirms inline) |

---

## Architecture

**Voice Transcription Pipeline:**

```
User taps mic → AVAudioEngine records → Stop tap → Process:
  1. WhisperKit transcribes raw audio (~500MB model)
  2. Filter hallucinations ([BLANK_AUDIO], etc.)
  3. LLM cleans filler words + punctuation (~1.5GB model)
  4. Format with paragraph breaks (every 2-3 sentences)
  5. Insert cleaned text into editor
```

**Key Design Decisions:**
- **Buffered recording** (not streaming) — allows LLM cleanup before insertion
- **Task lifecycle management** — explicit `Task<Void, Never>?` property for cancellation
- **File size validation** — prevents loading corrupt models from interrupted downloads
- **5-minute recording limit** — prevents WhisperKit performance degradation
- **2B LLM model** (not 0.8B) — better cleanup quality per eng review
- **Models stay resident** — ~1.3GB RAM steady-state for fast response (~3-4s for short recordings)

---

## Development

### Run tests

```bash
xcodegen generate
xcodebuild test -project Hemingway.xcodeproj -scheme Hemingway -destination 'platform=macOS'
```

### Quick build for testing

```bash
xcodegen generate
xcodebuild -project Hemingway.xcodeproj -scheme Hemingway -configuration Debug
open ./build/Build/Products/Debug/Hemingway.app
```

---

## Troubleshooting

### Build fails with "swift-jinja contains incompatible tools version (6.0.0)"

You're using Xcode 15.x. WhisperKit requires Xcode 16.0+.

**Solution:** Download Xcode 16 from https://developer.apple.com/download/

### Models fail to download

Check internet connection. Models download from Hugging Face (~2GB total) on first run.

If download is interrupted, delete corrupt files:
```bash
rm -rf ~/Library/Application\ Support/Hemingway/models/
```

Then restart the app to re-download.

---

## License

MIT
