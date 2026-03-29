# TODOS

## P3 — Phase 2: Coach Platform

**What:** Extend `useCoach`'s staleness API (`staleCards`, `topNudges`, `getTier`) as a platform for richer coaching features.

**Why:** The hook is a clean abstraction that knows which ideas are stuck and for how long. That context is useful beyond the current feature.

**Candidates:**
- Streak tracking ("You've worked on drafts 4 days in a row")
- Weekly digest view: summary of stale posts + suggested focus order
- "Celebration" moment when a finalized post ships (confetti, progress summary)
- Staleness threshold tuning UI (sliders for mild/urgent day counts)

**Effort:** M (human: ~1 week) → with CC: ~1 hour per feature
**Depends on:** Ambient Coach feature shipped and stable

---

## P3 — Snooze persistence across restarts

**What:** Move snooze state from `localStorage` to `electron-store` so snooze survives app restarts.

**Why:** Currently, if you snooze a card and restart the app, the snooze is gone and the card immediately reappears as stale. For a daily-use tool, this is a friction point.

**Effort:** S (human: ~2h) → with CC: ~10 min
**Depends on:** Ambient Coach feature shipped

---

## P3 — net.request for Anthropic API calls

**What:** Replace Node `fetch` in `coach:ask` IPC handler with Electron's `net.request`, which respects macOS system proxy settings.

**Why:** Node's native fetch ignores the system proxy. On networks with a proxy configured, coach API calls will silently fail. `net.request` is the Electron-idiomatic fix.

**Effort:** S (human: ~1h) → with CC: ~5 min
**Depends on:** Ambient Coach feature shipped
