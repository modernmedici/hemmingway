# Hemingway

I wanted to stop procrastinating about my public writing so I made this tool, as a way to capture ideas, and shape them into fully fleshed thoughts. 

A minimal kanban board for writers. Move your ideas from spark to published post — nothing more, nothing less.

---

## Features

- **Three-stage workflow** — Ideas → Drafts → Finalized Posts
- **Inline editing** — click any post to edit title and body in place
- **Keyboard shortcuts** — `⌘↵` to save, `Esc` to cancel
- **Move posts** with left/right arrow buttons
- **Persistent** — everything saved to `localStorage`, survives page refreshes
- **Resilient** — corrupted storage is silently discarded, board starts fresh

## Stack

- [React 19](https://react.dev) + [Vite 7](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com) (CSS-first, no config file)
- [Lucide React](https://lucide.dev) for icons

## Getting Started

```bash
git clone https://github.com/modernmedici/hemmingway.git
cd hemmingway
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Usage

| Action | How |
|---|---|
| Create a post | Click **+ New post** in any column |
| Edit a post | Click the title or body text |
| Save edits | Click **Save** or press `⌘↵` |
| Cancel edits | Press `Esc` or click **Cancel** |
| Move a post | Click `‹` or `›` on the card |
| Delete a post | Click the trash icon (confirms first) |

## Project Structure

```
src/
├── hooks/
│   └── useKanban.js       # State + localStorage persistence
└── components/
    ├── Board.jsx           # Column layout, new-post form routing
    ├── Column.jsx          # Column header, card list, empty state
    ├── PostCard.jsx        # View + inline edit mode, move/delete
    └── NewPostForm.jsx     # Inline create form
```

## License

MIT
