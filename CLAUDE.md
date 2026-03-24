# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint
```

## Testing

```bash
bun run test          # Run all tests once (vitest run)
bun run test:watch    # Watch mode
```

Test framework: Vitest + @testing-library/react + happy-dom.
Test files live alongside source in `__tests__/` subdirectories.
100% test coverage is the goal — tests make vibe coding safe.

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

## Branch Architecture — Three Divergent Builds

This repository has three active branches with **incompatible architectures**. Do not merge between them without understanding the differences.

```
origin/main (Electron IPC build)
  ├── Runtime: electron-vite, Electron v41
  ├── Storage: ~/Desktop/Hemingway/*.md files (gray-matter frontmatter)
  ├── API:     window.api.posts.* / window.api.linkedin.* via contextBridge IPC
  └── Tests:   feature/electron-tests → merges here first

feature/ambient-coach (THIS BRANCH — web-only build)
  ├── Runtime: Vite dev server only (npm run dev)
  ├── Storage: localStorage (posts, kanban state, snooze keys)
  ├── API:     /api/coach → Vite proxy → Anthropic API (dev-only, see below)
  └── Status:  NOT a merge candidate for origin/main
               Lives here until validated, then rebuilt natively

feature/swift-rewrite (SwiftUI macOS build)
  ├── Runtime: Xcode / SwiftUI
  └── Status:  Parallel exploration, no merge path yet
```

**IMPORTANT:** `feature/ambient-coach` is web-only and permanently diverged from `origin/main` (Electron IPC). Do not attempt to merge this branch into main. The coach feature will be rebuilt natively after the validation gate is met.

## Ambient Coach — Vite Proxy

The Vite dev server forwards `/api/coach` POST requests to the Anthropic API:

```
Browser → POST /api/coach → Vite dev server (Node.js) → Anthropic API
```

**Key constraints:**
- `ANTHROPIC_API_KEY` is used **server-side in Node.js context only** — never exposed to browser bundles.
- The proxy only exists during `npm run dev`. It does NOT exist in production builds or the Electron app.
- Coaching is intentionally dev-only for this phase. Production coaching is out of scope.
- `VITE_ANTHROPIC_API_KEY` (with the `VITE_` prefix) is documented in `.env.example` as a **warning comment only** — this prefix would expose the key to browser bundles. Do not add it to actual code.

See `.env.example` for setup instructions.

## Validation Gate

Before porting the ambient coach to Electron, it must pass the validation gate.
See [VALIDATION_GATE.md](./VALIDATION_GATE.md) for criteria.

## Active Branch: Electron Migration (origin/main)

The main branch (`origin/main`) is the Electron desktop app:
- Build tool: `electron-vite`; scripts: `npm run dev` / `npm run build` / `npm run dist:mac`
- LinkedIn OAuth: Electron main process IPC (`linkedin:*` channels), token in `electron-store`
- Posts: `.md` files in `~/Desktop/Hemingway/` (gray-matter YAML frontmatter), via `posts:*` IPC
- Renderer API: `window.api.linkedin.*` and `window.api.posts.*` (contextBridge in `electron/preload/index.js`)
