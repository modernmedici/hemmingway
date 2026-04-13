# TODOS

## P2 — Collaboration: Invitation Duplicate Detection

**What:** Prevent sending duplicate invitations to the same email for the same board. Query existing invitations before creating, show "Already invited" error if pending/accepted invitation exists.

**Why:** Currently, inviting the same email twice creates two invitation records that both appear in the recipient's banner. Both work (accepting either adds the user as member), but it's confusing UX. Low severity but worth fixing for polish.

**Pros:** Cleaner UX (one invitation per email), prevents confusion.  
**Cons:** Adds query overhead to invitation flow, need to decide behavior for declined invitations.

**Context:** Flagged during eng review as failure mode. Edge case (rare to invite twice) but easy fix.

**Effort:** S (human: ~2h) → with CC: ~15 min  
**Depends on:** Collaboration shipped (Issue 1A-1H fixes)

---

## P2 — Ambient Coach: Update Design Doc for InstantDB

**What:** Revise the Ambient Coach design doc (March 21, 2026) to work with InstantDB architecture instead of localStorage + Electron.

**Why:** The original design assumes localStorage-based state management and Electron IPC. The app is now InstantDB + web with collaborative boards. The coach's staleness tracking, snooze state, and modal interactions need rethinking. Key design questions:
- Staleness of whose posts? (In collaborative boards, do I see staleness for posts I didn't write?)
- Snooze state: localStorage or InstantDB? (If InstantDB, synced across devices but adds DB queries)
- Coach modal: how does it interact with edit locking? (Can I coach myself while someone else is editing?)

**Pros:** Coach can be implemented from a valid design doc, architectural decisions documented.  
**Cons:** Design work before implementation, coach may not be prioritized over other features.

**Context:** Ambient Coach was the original March plan. Collaboration was built instead (more urgent). The coach design is now obsolete. Run `/office-hours` when coach becomes priority to produce updated design doc for InstantDB architecture.

**Effort:** M (human: ~2h design) → with CC: ~1h via /office-hours  
**Depends on:** Collaboration stable

---

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
