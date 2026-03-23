# TODOS

## Deferred from Ambient Coach feature (2026-03-21)

### [ ] Full DOM + modal test coverage (T7–T22)

**What:** Add React Testing Library tests for CoachingModal button states and PostCard visual staleness tiers.

**Why:** The Vitest hook tests (T1–T6) cover core logic, but the modal interactions and card visual states (amber glow, badge text, click routing) have no automated coverage. Any future refactor of these components requires full manual visual verification.

**Pros:** Refactor CoachingModal or PostCard with confidence; catch regressions automatically.

**Cons:** Requires `@testing-library/react` + `vi.fn()` fetch mocking setup. Not complex, just more surface area.

**Context:** Hook tests were added first (T1–T6 in `src/hooks/useCoach.test.js`). These DOM tests follow once the core logic is trusted. Tests to add cover: modal spinner/error/success states, button disabled-while-in-flight, "Turn into draft" visibility by column, snooze dropdown, and PostCard click routing for each staleness tier.

**Depends on:** Vitest + useCoach hook tests (T1–T6) must be in place first.

**Where to start:** `src/components/__tests__/CoachingModal.test.jsx` and `src/components/__tests__/PostCard.test.jsx`. Use `vi.stubGlobal('fetch', ...)` for API mocking.

---

## Deferred from CEO Review (2026-03-21)

### [ ] Coach Memory — don't repeat questions

**What:** Store the last 3 questions the AI asked per post in localStorage. Pass them in the API prompt so the coach doesn't repeat itself across sessions.

**Why:** After a week of use, the coach will start asking the same kinds of questions. Memory makes it feel like a relationship, not a random prompt generator.

**Pros:** Better coaching quality over time. Tiny storage footprint (~100 bytes per post).

**Cons:** Slightly more complex prompt construction. Need to truncate question history if questions are very long (cap at ~500 chars total).

**Context:** The snooze localStorage pattern (`coach_snooze_${id}`) is the model. A parallel key `coach_history_${id}` stores the last 3 questions as a JSON array. When building the Anthropic prompt, append: `"Previously asked: [q1, q2, q3] — do not repeat these."` The CoachingModal's success handler writes the new question to this key.

**Effort:** S (human: ~2h / CC: ~10 min) | **Priority:** P2

**Depends on:** useCoach hook and CoachingModal must be complete first.

---

### [ ] Electron Daily Nudge Notification (P1 — highest behavioral impact)

**What:** The Electron app sends a macOS push notification at 9am if there are stale ideas: "Hemingway: 2 ideas need attention." Clicking the notification deep-links to the app focused on the most urgent stale card.

**Why:** The web app requires you to open it to see nudges. A push notification reaches you before you open the app — true proactive coaching. This is the highest-leverage behavioral intervention in the entire roadmap.

**Pros:** Closes the loop on proactive coaching. Reaches you when you're not thinking about writing. Native macOS integration feels intentional.

**Cons:** Requires separate work on the Electron branch (different codebase, different storage format). The staleness logic runs in the Electron main process against `.md` files in `~/Desktop/Hemingway/` (not localStorage) — a port of useCoach logic.

**Context:** The Electron branch is at `.worktrees/electron-migration`. Implementation: (1) port staleness computation to main process, (2) use `node-cron` or `setTimeout` to schedule 9am check, (3) call `new Notification()` via Electron's main process, (4) handle the `notification-click` event to focus the app and open the stale post. This is a self-contained PR on the electron-migration branch.

**Effort:** M (human: ~1 day / CC: ~30 min, Electron branch) | **Priority:** P1

**Depends on:** Web coach (this PR) ships and is used for 1 week first — validates the staleness thresholds before porting them.
