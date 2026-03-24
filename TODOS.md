# TODOS


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

---

## Deferred from Eng Review (2026-03-24)

### [ ] Snooze UX — dropdown vs popover vs split button

**What:** The current snooze UI uses a `<select>` dropdown (3 days / 7 days / 14 days) next to a "Snooze" button. Decide whether this is the right interaction pattern.

**Why:** A `<select>` is functional but may feel clunky. Alternatives: a popover with day chips, or a split button (click = default 3d, arrow = options). The right choice depends on how often users interact with snooze and whether they change the duration.

**Pros of `<select>`:** Already shipped, no additional UI complexity. **Pros of popover/split:** Faster interaction, more intentional UX, better mobile feel.

**Cons:** Design work required; any change needs regression testing of the snooze flow.

**Context:** Decision deferred until after validation gate — observe how users actually snooze before optimizing the interaction. If most snoozes use the default 3d, a split button makes the happy path one click instead of two.

**Effort:** S (human: ~2h / CC: ~10 min) | **Priority:** P2

**Depends on:** Validation gate results (1 week of real use).

---

### [ ] Merge sequence — electron-tests → main before ambient-coach

**What:** `feature/electron-tests` must merge into `origin/main` first, before `feature/ambient-coach` advances toward any potential merge (if/when the coach is rebuilt natively).

**Why:** The two branches have divergent architectures. Merging ambient-coach before electron-tests would create conflicts with the Electron IPC structure in main.

**Pros:** Clean git history, no architectural conflicts.

**Cons:** Ambient-coach cannot merge until electron-tests lands — but ambient-coach is NOT a merge candidate for main in its current form anyway (web-only).

**Context:** `feature/electron-tests` is ready to merge (PR open). Merge it first. `feature/ambient-coach` stays as a parallel web branch until the validation gate is met, then the coach is rebuilt natively on the Electron architecture.

**Effort:** S (human: ~30 min / CC: ~5 min) | **Priority:** P1 (do before any native port)

**Depends on:** PR for feature/electron-tests must be merged first.

---

### [ ] Proxy integration test — verify /api/coach end-to-end

**What:** Add an integration test that spins up the Vite dev server and hits `/api/coach` with a real or mocked `ANTHROPIC_API_KEY` to verify the proxy route works end-to-end.

**Why:** The current unit tests pass even if the Vite proxy is misconfigured. A misconfigured proxy silently breaks the entire coach feature — the unit tests give false confidence. An integration test that actually exercises the proxy catches configuration drift (e.g., route path changes, missing env var, response shape changes).

**Pros:** Catches proxy misconfiguration that unit tests miss. Gives confidence that the full stack works before testing manually.

**Cons:** Requires starting the Vite dev server in tests (slower, more setup). May need a mock Anthropic server to avoid real API calls in CI.

**Context:** The proxy is defined in `vite.config.js` under `server.proxy['/api/coach']`. A possible approach: use `@playwright/test` or `vitest` with a Vite preview server + `msw` to intercept the upstream Anthropic call. Alternative: shell script that runs `npm run dev` in background, curls `/api/coach`, checks response shape.

**Effort:** M (human: ~1 day / CC: ~30 min) | **Priority:** P2

**Depends on:** Web coach ships and is validated first.
