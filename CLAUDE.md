# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint
```

No test suite exists. `npm run build` is the primary correctness check.

Node.js is managed via nvm. If `npm` is not on PATH, use:
```bash
export PATH="$HOME/.nvm/versions/node/v24.11.1/bin:/usr/bin:/bin:/usr/sbin:/sbin"
```

## Environment Variables

Create `.env.local` for LinkedIn integration:
```
VITE_LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
```

## Architecture

**Two-view app** — `App.jsx` switches between `'board'` and `'editor'` views. There is no router; view state is a `useState` string in `App.jsx`.

**State is owned by two hooks:**
- `useKanban.js` — all post CRUD + localStorage persistence. Posts have shape `{ id, title, body, column, createdAt, updatedAt }`. `column` is one of `'ideas' | 'drafts' | 'finalized'` (defined in `src/lib/constants.js`).
- `useLinkedIn.js` — PKCE OAuth flow, token/profile state in localStorage, `publishPost` calls the Vite dev-server proxy at `/api/linkedin/*`.

**LinkedIn OAuth flow** (browser-only, dev mode): `connect()` redirects to LinkedIn. The Vite dev server intercepts the callback at `/auth/linkedin/callback`, exchanges the code for a token server-side, then redirects to `/?linkedin_token=...`. `App.jsx` detects the query param and calls `linkedin.receiveToken(token)`.

**Styling:** Tailwind CSS v4 (CSS-first, no `tailwind.config.js`). Design tokens are HSL CSS custom properties defined in `src/styles/tokens.css`. Dark mode uses the `.dark` class on `<html>`. Fonts are Libre Baskerville (headings/body text in editor) and Inter (UI chrome), loaded from Google Fonts. Column IDs, labels, and brand colors are centralized in `src/lib/constants.js` — don't hardcode them in components.

**Component tree:**
```
App
├── AppShell          — sidebar layout (logo, new-idea button, dark toggle, linkedin slot)
│   ├── AccountsPanel — LinkedIn connect/disconnect
│   └── Board         — 3-column kanban grid
│       └── Column    — header + card list + empty state
│           └── PostCard — word count, timestamp (date-fns), three-dot menu
└── WritingView       — full-page editor (replaces Board when view='editor')
    └── PublishModal  — confirm-before-publish overlay
```

## Active Branch: Electron Migration

`feature/electron-migration` (worktree at `.worktrees/electron-migration`) converts this app to a native macOS Electron desktop app:
- Build tool becomes `electron-vite`; scripts change to `npm run dev` / `npm run build` / `npm run dist:mac`
- LinkedIn OAuth moves from Vite middleware + browser fetch → Electron main process IPC (`linkedin:*` channels), token stored in `electron-store`
- Posts move from localStorage → `.md` files in `~/Desktop/Hemingway/` (gray-matter for YAML frontmatter), read/written via `posts:*` IPC
- `window.api.linkedin.*` and `window.api.posts.*` are the renderer-facing APIs (exposed via contextBridge in `electron/preload/index.js`)
