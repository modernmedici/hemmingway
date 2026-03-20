# Hemingway

I wanted to stop procrastinating about my public writing so I made this tool, as a way to capture ideas, and shape them into fully fleshed thoughts.

A minimal kanban board for writers. Move your ideas from spark to published post.

---

## Versions

| Version | Branch | Description |
|---|---|---|
| **Web app** | `main` | React + Vite, runs in the browser |
| **Native macOS app** | `feature/swift-rewrite` | SwiftUI, saves `.md` files to `~/Desktop/Hemingway/` |

Both versions share the same file format — notes written in either app are readable by the other.

---

## Native macOS App (SwiftUI)

### Requirements

- macOS 13+
- [Xcode](https://apps.apple.com/app/xcode/id497799835) (free on the App Store)
- [xcodegen](https://github.com/yonaskolb/XcodeGen): `brew install xcodegen`

### Getting Started

```bash
git clone https://github.com/modernmedici/hemingway.git
cd hemingway
git checkout feature/swift-rewrite
xcodegen generate
open Hemingway.xcodeproj
```

Hit **⌘R** to build and run. The first build downloads the Yams dependency (~1 min).

### Features

- **Three-stage kanban** — Scratchpad → Drafts → Published
- **Full-page editor** — Georgia type, distraction-free, ⌘↵ to save, Esc to go back
- **Voice dictation** — click the mic to transcribe speech directly into the editor (on-device, no data sent to Apple servers)
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

## Web App (React)

### Getting Started

```bash
git clone https://github.com/modernmedici/hemingway.git
cd hemingway
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Features

- **Three-stage workflow** — Scratchpad → Drafts → Published
- **Warm academic design** — Libre Baskerville + Inter, HSL color tokens, light/dark mode
- **Full writing view** — distraction-free editor with sticky header and keyboard shortcuts
- **Word count badge** — always visible on each card
- **Relative timestamps** — "2 minutes ago" style on every post
- **Three-dot card menu** — move, delete (with confirm), or publish from any card
- **LinkedIn publishing** — connect once via OAuth, publish finalized posts directly to your feed
- **Persistent** — everything saved to `localStorage`, survives page refreshes

### LinkedIn Publishing (optional)

1. Create a LinkedIn Developer App at https://www.linkedin.com/developers/apps
2. Add `http://localhost:5173/auth/linkedin/callback` as an Authorized Redirect URL
3. Request scopes: `openid profile w_member_social`
4. Create `.env.local` in the project root:

```
VITE_LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
```

Then connect your account from the sidebar and publish any post in the **Published** column.

### Stack

- [React 19](https://react.dev) + [Vite 7](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com) (CSS-first, no config file)
- [framer-motion](https://www.framer.com/motion/) for card animations
- [Lucide React](https://lucide.dev) for icons
- [date-fns](https://date-fns.org) for relative timestamps
- LinkedIn OAuth 2.0 (PKCE) + UGC Posts API v2

### Project Structure

```
src/
├── hooks/
│   ├── useKanban.js        # State + localStorage persistence
│   └── useLinkedIn.js      # PKCE OAuth, token state, publishPost
├── styles/
│   └── tokens.css          # HSL color tokens (light + dark mode)
└── components/
    ├── AppShell.jsx         # Persistent sidebar layout
    ├── Board.jsx            # Three-column kanban grid
    ├── Column.jsx           # Column header, card list, empty state
    ├── PostCard.jsx         # Card with word count, timestamp, three-dot menu
    ├── WritingView.jsx      # Full-page distraction-free editor
    ├── AccountsPanel.jsx    # LinkedIn connect/disconnect UI
    └── PublishModal.jsx     # Preview + confirm before publishing
```

---

## License

MIT
