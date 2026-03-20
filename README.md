# Hemmingway

I wanted to stop procrastinating about my public writing so I made this tool, as a way to capture ideas, and shape them into fully fleshed thoughts.

A minimal kanban board for writers. Move your ideas from spark to published post.

---

## Versions

| Version | Branch | Description |
|---|---|---|
| **Native macOS app (SwiftUI)** | `feature/swift-rewrite` | Pure SwiftUI, no Electron |
| **Desktop app (Electron)** | `feature/electron-migration` | React + Electron |
| **Web app** | `main` | React + Vite, runs in the browser |

All three versions share the same file format — posts saved as YAML-frontmatter `.md` files in `~/Desktop/Hemingway/` are readable across all versions.

---

## Native macOS App (SwiftUI)

The cleanest version. A proper native macOS app with voice dictation.

### Requirements

- macOS 13+
- [Xcode](https://apps.apple.com/app/xcode/id497799835) (free on the App Store)
- [xcodegen](https://github.com/yonaskolb/XcodeGen): `brew install xcodegen`

### Getting Started

```bash
git clone https://github.com/modernmedici/hemmingway.git
cd hemmingway
git checkout feature/swift-rewrite
xcodegen generate
open Hemingway.xcodeproj
```

Hit **⌘R** to build and run. The first build downloads the Yams dependency (~1 min).

### Features

- **Three-stage kanban** — Scratchpad → Drafts → Published
- **Full-page editor** — Georgia type, distraction-free, ⌘↵ to save, Esc to go back
- **Voice dictation** — click the mic to transcribe speech directly into the editor (on-device, no audio sent to Apple)
- **File-based persistence** — posts saved as YAML-frontmatter `.md` files in `~/Desktop/Hemingway/`
- **Native dark mode** — follows macOS system appearance automatically

### Usage

| Action | How |
|---|---|
| Create a post | Click **+ New Idea** in the header or **+** in any column |
| Edit a post | Click any card |
| Save | Click **Save** or press `⌘↵` |
| Go back | Press `Esc` or click **Back to Board** |
| Move a post | Hover card → `⋯` menu → Move to … |
| Delete a post | Hover card → `⋯` menu → Delete (confirms inline) |
| Voice dictation | Open editor → click mic button → speak → click again to stop |

### Project Structure

```
Hemingway/
├── Models/
│   └── Post.swift                  # Column enum + Post struct
├── Services/
│   ├── PostSerializer.swift        # YAML frontmatter encode/decode (Yams)
│   ├── PostStore.swift             # ObservableObject: CRUD + file I/O
│   └── TranscriptionService.swift  # SFSpeechRecognizer + AVAudioEngine
└── Views/
    ├── ContentView.swift            # Root: board ↔ editor navigation
    ├── BoardView.swift              # 3-column kanban layout
    ├── ColumnView.swift             # Column header + card list
    ├── PostCardView.swift           # Card with hover menu
    └── EditorView.swift             # Full-page editor
```

---

## Desktop App (Electron)

### Getting Started

```bash
git clone https://github.com/modernmedici/hemmingway.git
cd hemmingway
git checkout feature/electron-migration
npm install
npm run dev
```

The app opens as a native macOS window. Posts are saved to `~/Desktop/Hemingway/` as markdown files.

### Building

```bash
npm run dist:mac   # produces a .dmg in dist-electron/
```

### Stack

- [Electron](https://www.electronjs.org) + [electron-vite](https://electron-vite.org)
- [React 19](https://react.dev) + [Vite 7](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [gray-matter](https://github.com/jonschlinkert/gray-matter) for markdown frontmatter
- [electron-store](https://github.com/sindresorhus/electron-store) for persistence

### Project Structure

```
electron/
├── main/index.js       # Main process: IPC handlers, file I/O, app setup
└── preload/index.js    # contextBridge: exposes window.api to renderer
src/
├── hooks/
│   └── useKanban.js    # Post CRUD, syncs to ~/Desktop/Hemingway/ via IPC
├── styles/
│   └── tokens.css      # HSL color tokens
└── components/
    ├── AppShell.jsx    # Sidebar layout
    ├── Board.jsx       # Three-column kanban grid
    ├── Column.jsx      # Column header + card list
    ├── PostCard.jsx    # Card with word count, timestamp, three-dot menu
    └── WritingView.jsx # Distraction-free editor
```

---

## Web App (React)

### Getting Started

```bash
git clone https://github.com/modernmedici/hemmingway.git
cd hemmingway
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Features

- **Three-stage workflow** — Scratchpad → Drafts → Published
- **Warm academic design** — Libre Baskerville + Inter, HSL color tokens, light/dark mode
- **LinkedIn publishing** — connect once via OAuth, publish finalized posts directly to your feed
- **Persistent** — everything saved to `localStorage`

### LinkedIn Publishing (optional)

1. Create a LinkedIn Developer App at https://www.linkedin.com/developers/apps
2. Add `http://localhost:5173/auth/linkedin/callback` as an Authorized Redirect URL
3. Request scopes: `openid profile w_member_social`
4. Create `.env.local`:

```
VITE_LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
```

---

## License

MIT
