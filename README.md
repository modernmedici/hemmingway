# Hemmingway

I wanted to stop procrastinating about my public writing so I made this tool, as a way to capture ideas, and shape them into fully fleshed thoughts.

A minimal macOS writing app. Move your ideas from spark to published post.

---

## Features

- **Three-stage workflow** — Scratchpad → Drafts → Published
- **Warm academic design** — Libre Baskerville + Inter, HSL color tokens
- **Full writing view** — distraction-free editor with auto-resizing title and keyboard shortcuts
- **Word count badge** — always visible on each card
- **Relative timestamps** — "2 minutes ago" style on every post
- **Three-dot card menu** — move or delete (with confirm) from any card
- **Persistent** — posts saved as `.md` files in `~/Desktop/Hemingway/`

## Stack

- [Electron](https://www.electronjs.org) + [electron-vite](https://electron-vite.org)
- [React 19](https://react.dev) + [Vite 7](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com) (CSS-first, no config file)
- [framer-motion](https://www.framer.com/motion/) for card animations
- [Lucide React](https://lucide.dev) for icons
- [date-fns](https://date-fns.org) for relative timestamps
- [gray-matter](https://github.com/jonschlinkert/gray-matter) for markdown frontmatter
- [electron-store](https://github.com/sindresorhus/electron-store) for persistence

## Getting Started

```bash
git clone https://github.com/modernmedici/hemmingway.git
cd hemmingway
git checkout feature/electron-migration
npm install
npm run dev
```

The app opens as a native macOS window. Posts are saved to `~/Desktop/Hemingway/` as markdown files.

## Building

```bash
npm run dist:mac   # produces a .dmg in dist-electron/
```

## Usage

| Action | How |
|---|---|
| Create a post | Click **+ New Idea** in the sidebar |
| Edit a post | Click any card |
| Save | Click **Save** or press `⌘↵` |
| Cancel | Press `Esc` or click **Back to Board** |
| Move a post | Open the three-dot menu on the card |
| Delete a post | Three-dot menu → Delete (confirms inline) |

## Project Structure

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
build/
└── icon.png / icon.icns  # App icon (warm dark squircle + BookOpen)
```

## License

MIT
