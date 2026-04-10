# Hemingway

Modern web-based writing app with cloud sync. Kanban-style workflow: Ideas → Drafts → Finalized.

---

## Features

- **Three-stage workflow** — Ideas → Drafts → Finalized
- **Cloud sync** — Real-time sync across devices via InstantDB
- **Magic code auth** — Passwordless email authentication
- **Distraction-free editor** — Clean interface with native fullscreen mode
- **Auto-save** — Changes saved automatically on navigation
- **Real-time word count** — Live tracking with animated feedback
- **Polished interactions** — Smooth animations and hover states

---

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- InstantDB account (free at [instantdb.com](https://instantdb.com))

### Installation

```bash
# Clone the repo
git clone https://github.com/modernmedici/hemmingway.git
cd hemmingway

# Install dependencies
bun install
# or: npm install

# Set up environment variables
cp .env.example .env
# Add your InstantDB app ID and admin token to .env

# Push schema to InstantDB
bun x instant-cli push schema
bun x instant-cli push perms

# Start dev server
bun run dev
# or: npm run dev
```

Open http://localhost:5173 and sign in with magic code authentication.

---

## Tech Stack

- **Frontend:** React 18 + Vite
- **Database:** InstantDB (real-time sync)
- **Authentication:** Magic code (passwordless email)
- **Animations:** Framer Motion
- **Styling:** CSS custom properties + Tailwind v4
- **Typography:** EB Garamond (serif) + Inter (sans-serif)

---

## Project Structure

```
src/
├── instant.schema.ts      # InstantDB schema definition
├── instant.perms.ts       # User-scoped permissions
├── lib/
│   ├── db.js              # InstantDB client initialization
│   └── constants.js       # Fonts and column definitions
├── components/
│   ├── AuthScreen.jsx     # Two-step magic code auth
│   ├── Board.jsx          # Three-column Kanban layout
│   ├── Column.jsx         # Individual column with animations
│   ├── PostCard.jsx       # Card with move/delete actions
│   ├── WritingView.jsx    # Distraction-free editor + fullscreen
│   └── AppShell.jsx       # Main app container
└── hooks/
    └── useKanban.js       # All CRUD operations via InstantDB
```

---

## Usage

| Action | How |
|--------|-----|
| **Sign in** | Enter email → receive code → enter code |
| **Create post** | Click **+ New Idea** button |
| **Edit post** | Click any card |
| **Save** | Click **Save** or press `⌘↵` |
| **Fullscreen** | Click maximize icon or press `⌘⇧F` |
| **Exit fullscreen** | Press `Esc` or hover top-right corner |
| **Move post** | Three-dot menu → Move to [column] |
| **Delete post** | Three-dot menu → Delete |
| **Navigate back** | Press `Esc` or click **Back to Board** |

---

## Authentication

Uses InstantDB's magic code authentication:

1. User enters email
2. InstantDB sends 6-digit code
3. User enters code to sign in
4. Session persists across devices

**Test user** (development):
- Email: `modernmedici88@gmail.com`
- Code: `424242`

---

## Database Schema

### Posts
- `title` (string) — Post title
- `body` (string, optional) — Post content
- `column` (string) — "ideas" | "drafts" | "finalized"
- `createdAt` (date) — Creation timestamp
- `updatedAt` (date) — Last modified timestamp

### Relationships
- `creator` (user → post) — Post owner

### Permissions
- Users can only view/edit their own posts
- Posts are scoped by `creator.id`

---

## Development

### Commands

```bash
# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Run linter
bun run lint

# Run tests
bun run test

# Run tests in watch mode
bun run test:watch
```

### InstantDB CLI

```bash
# Pull schema from production
bun x instant-cli pull schema

# Push local schema to production
bun x instant-cli push schema

# Query database
bun x instant-cli query '{ posts: {} }'

# Open InstantDB Explorer
bun x instant-cli explorer
```

---

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Environment Variables

Required for production:

```bash
VITE_INSTANT_APP_ID=your-app-id-here
```

⚠️ Never commit `.env` or expose your admin token in client-side code.

---

## Architecture

### Data Flow

```
User action → useKanban hook → InstantDB transact → Real-time sync → UI update
```

### Key Design Decisions

- **InstantDB transactions** — Atomic operations with `.transact()`
- **Optimistic UI** — InstantDB handles optimistic updates automatically
- **User-scoped data** — Posts linked to creator via `creator` relationship
- **Auto-save** — Changes saved on navigation, not explicit save button spam
- **Fullscreen API** — Native browser fullscreen (like YouTube)
- **Framer Motion** — Staggered animations for column cards
- **CSS custom properties** — Design tokens for consistent theming

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘↵` | Save post |
| `⌘⇧F` | Toggle fullscreen mode |
| `Esc` | Exit editor / fullscreen / cancel |

---

## Troubleshooting

### Posts not syncing

1. Check browser console for errors
2. Verify InstantDB app ID in `.env`
3. Check network tab for API failures
4. Ensure user is authenticated

### Schema changes not applying

```bash
# Pull latest schema
bun x instant-cli pull schema

# Or push local schema
bun x instant-cli push schema
```

### Permission errors

Check `instant.perms.ts` and ensure:
- `isOwner` rule references `creator.id`
- Posts are linked with `{ creator: user.id }`

---

## Migration from Native App

The previous Swift/Electron version used local file storage. To migrate:

1. Export markdown files from `~/Desktop/Hemingway/`
2. Run migration script (see `docs/` for details)
3. Posts preserve original timestamps and columns

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT

---

## Acknowledgments

- [InstantDB](https://instantdb.com) — Real-time database
- [Framer Motion](https://framer.com/motion) — Animation library
- [Lucide Icons](https://lucide.dev) — Icon set
- [EB Garamond](https://fonts.google.com/specimen/EB+Garamond) — Serif typography
