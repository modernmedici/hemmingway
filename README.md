# Hemingway

I wanted to stop procrastinating about my public writing so I made this tool, as a way to capture ideas, and shape them into fully fleshed thoughts.

A minimal kanban board for writers. Move your ideas from spark to published post — including directly to LinkedIn.

---

## Features

- **Three-stage workflow** — Scratchpad → Drafts → Published
- **Warm academic design** — Libre Baskerville + Inter, HSL color tokens, light/dark mode
- **Full writing view** — distraction-free editor with sticky header and keyboard shortcuts
- **Word count badge** — always visible on each card
- **Relative timestamps** — "2 minutes ago" style on every post
- **Three-dot card menu** — move, delete (with confirm), or publish from any card
- **LinkedIn publishing** — connect once via OAuth, publish finalized posts directly to your feed
- **Persistent** — everything saved to `localStorage`, survives page refreshes

## Stack

- [React 19](https://react.dev) + [Vite 7](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com) (CSS-first, no config file)
- [framer-motion](https://www.framer.com/motion/) for card animations
- [Lucide React](https://lucide.dev) for icons
- [date-fns](https://date-fns.org) for relative timestamps
- LinkedIn OAuth 2.0 (PKCE) + UGC Posts API v2

## Getting Started

```bash
git clone https://github.com/modernmedici/hemingway.git
cd hemingway
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

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

## Usage

| Action | How |
|---|---|
| Create a post | Click **+ New Idea** in the sidebar or **+ New post** in any column |
| Edit a post | Click any card |
| Save | Click **Save** or press `⌘↵` |
| Cancel | Press `Esc` or click **Back to Board** |
| Move a post | Open the three-dot menu on the card |
| Delete a post | Three-dot menu → Delete (confirms inline) |
| Toggle dark mode | Click `☾` / `☀` in the sidebar footer |
| Publish to LinkedIn | Move post to **Published** → three-dot menu → Publish to LinkedIn |

## Project Structure

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

## License

MIT
