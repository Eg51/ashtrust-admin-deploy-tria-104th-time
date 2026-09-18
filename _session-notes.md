<!-- <!-- # Session Notes — [date]

## Project
Next.js 16 banking app, MongoDB (native driver), dual auth (cookie session + JWT).
Admin + user roles. Repo: ashtrust, branch: main.

## Build facts (locked in)
- next pinned to 16.2.12
- build script: `next build --webpack` (Turbopack was broken)
- .env.local must NOT contain NODE_ENV
- run from `~/Documents/ashtrust` (capital D)
- after file changes: `rm -rf .next && npm run build`

## Completed
- Phase A: lib/api-helpers.js, app/api/auth/logout/route.js
- Phase B: chat participation checks (messages, mark-read, notifications/read)
- Phase C: invest/withdraw/admin-status — balance checks, escrow, optimistic locking
- Phase D: cleanup-sessions auth, ChatWidget auto-close removed, user/accounts whitelist, useSessionTracker fixes, track rewrite
- Phase E: password reset takeover closed (admin.js, check-password-reset, change-password, LoginPasswordReset, Activator, AdminUserManager)
- proxy.js: header forwarding fixed, isPublicRoute segment matching fixed
- lib/security.js: duplicate securityConfig export removed

## Remaining (in order)
1. Phase F: JWT secret fallback guard in lib/security.js
2. Rate limiting on auth routes
3. isStrongPassword + isValidUsername enforced on register
4. ensureUserIndexes() called at startup
5. admin.js: stop trusting x-user-role header (re-verify session/JWT directly)
6. Delete dead files: ChatWidget.tsx, .txt backups, duplicate admin components

## Working style that worked
- One file per message
- I paste full file, user saves, we rebuild before next file
- No batches, no audits, no tier tables
- If a file needs to be seen first, user runs `cat <path>` and pastes
## Verified state
- All Server Action callers render on matcher-protected routes (me/page.tsx, me/users/[userId]/page.tsx)
- No proxy.js matcher changes needed
- AdminUserManager.tsx is dead code (commented import in me/page.tsx:12)
- AdminUserDashboardEditor.tsx has duplicate commented block (lines 1-378, cosmetic cleanup needed)
## Phase G — started
- Confirmed recharts@3.10.1 installed
- NOT touching DashboardContent.tsx (has hand-rolled SVG charts already)
- File 1: app/components/charts/AnimatedCard.tsx (new, shared wrapper)
- Next: UserHealthDonut → edit AdminDashboard.tsx → build → verify
## Phase G — started
- Confirmed recharts@3.10.1 installed
- NOT touching DashboardContent.tsx (has hand-rolled SVG charts already)
- File 1: app/components/charts/AnimatedCard.tsx (new, shared wrapper)
- Next: UserHealthDonut → edit AdminDashboard.tsx → build → verify
# Session Notes — ashtrust

## Project
Next.js 16 banking app. MongoDB (native driver). Dual auth (cookie session + JWT).
Roles: user + admin. Repo: ashtrust, branch: main.

## Build facts (locked in)
- next pinned to 16.2.12 (no caret)
- build script: `next build --webpack` (Turbopack has a prerender bug)
- `.env.local` must NOT contain NODE_ENV
- run from `~/Documents/ashtrust` (capital D) — case matters on Windows
- after file changes: `rm -rf .next && npm run build`
- do NOT leave empty `app/api/**/route.js` files — Next type-checks them and fails
- `rmdir` only removes empty folders; use `rm -rf` for the whole tree
- recharts 3.x: prefer default Tooltip/axis behavior. Custom formatters trigger
  type errors (`ValueType | undefined`) — narrow inside the body, don't type the param
- `.txt` backups in app/ are inert (not routes). `.js` siblings of route.js are NOT

## Completed

### Phases A–E — security hardening (committed)
- Phase A: `lib/api-helpers.js`, `app/api/auth/logout/route.js`
- Phase B: chat participation checks (messages, mark-read, notifications/read)
- Phase C: invest / withdraw / admin-status — balance checks, escrow model,
  optimistic locking (string-amount lock via exact-match filter)
- Phase D: cleanup-sessions auth, ChatWidget auto-close removed,
  user/accounts whitelist, useSessionTracker fixes, track route rewrite
- Phase E: password reset takeover closed — admin-issued one-time SHA-256 code,
  15-min TTL, timing-safe compare, single-use. Files:
  `app/actions/admin.js` (issuePasswordResetToken),
  `app/api/check-password-reset/route.js`,
  `app/api/change-password/route.js`,
  `app/components/LoginPasswordReset.tsx`,
  `app/components/Activator.tsx`,
  `app/components/AdminUserManager.tsx`
- `proxy.js`: header forwarding fixed (forward via `NextResponse.next({ request: { headers }})`),
  `isPublicRoute` uses segment-boundary matching (no more '/' matching everything)
- `lib/security.js`: duplicate securityConfig export removed

### Verified state after Phases A–E
- All Server Action callers render on matcher-protected routes (me/page.tsx, me/users/[userId]/page.tsx)
- `AdminUserManager.tsx` is dead code (commented import in me/page.tsx:12)
- `AdminUserDashboardEditor.tsx` has a duplicate commented block (lines 1-378) — cosmetic cleanup pending
- Password reset end-to-end flow tested and working

## In progress — Phase G: Admin dashboard charts

**Requirements:** preserve existing logic + full responsiveness (mobile / tablet / desktop)

**Targets:**
- `AdminDashboard.tsx` — donut + line chart (Checkpoints 1 & 2)
- `Tracker.tsx` — donut + bar (Checkpoint 3, deferred)

**NOT touching:**
- `DashboardContent.tsx` — has beautiful hand-rolled SVG charts already; recharts would make it worse
- `AutoBalanceAdmin.tsx` — control panel, not a report
- `AdminWithdrawalList.tsx` — deferred until requests exist

**Files (in order):**

| # | File | Status |
|---|------|--------|
| G1 | `app/components/charts/AnimatedCard.tsx` (new) | ✅ |
| G2 | `app/components/charts/UserHealthDonut.tsx` (new) | ✅ |
| G3 | `app/components/AdminDashboard.tsx` (edit — donut slot) | ✅ |
| G4 | `app/api/admin/stats/timeseries/route.js` (new) | ⬜ |
| G5 | `app/components/charts/UserGrowthLine.tsx` (new) | ⬜ |
| G6 | `app/components/AdminDashboard.tsx` (edit — line slot, 2-col grid) | ⬜ |
| G7 | `app/components/charts/SessionStatusDonut.tsx` (new) | ⬜ |
| G8 | `app/components/Tracker.tsx` (edit) | ⬜ |

**Checkpoint 1 (G1–G3)** — build passes, donut renders on `/me` between stat cards and tabs.

**Checkpoint 2 (G4–G6)** — timeseries endpoint + line chart, section becomes 2-col grid (line left ~2/3, donut right ~1/3).

**Checkpoint 3 (G7–G8)** — session status donut on Tracker.

## Remaining security (deferred, from original audit)
1. Phase F: JWT secret fallback guard in `lib/security.js`
2. Rate limiting on auth routes
3. `isStrongPassword` + `isValidUsername` enforced on register
4. `ensureUserIndexes()` called at startup
5. `admin.js`: stop trusting `x-user-role` header — re-verify session/JWT directly
6. Delete dead files: `ChatWidget.tsx` (one t), `.txt` backups, `AdminUserManager.tsx`

## Working style that works
- One file per message
- I paste full file, user saves, we rebuild before next file
- No batches, no audits, no tier tables
- If a file needs to be seen first, user runs `cat <path>` and pastes
- Commit at the end of each phase, not mid-phase -->
# Session Notes — ashtrust

## Project
Next.js 16 banking app. MongoDB (native driver). Dual auth (cookie session + JWT).
Roles: user + admin. Repo: ashtrust, branch: main.

## Build facts (locked in)
- next pinned to 16.2.12 (no caret)
- build script: `next build --webpack` (Turbopack has a prerender bug)
- `.env.local` must NOT contain NODE_ENV
- run from `~/Documents/ashtrust` (capital D) — case matters on Windows
- after file changes: `rm -rf .next && npm run build`
- do NOT leave empty `app/api/**/route.js` files — Next type-checks them and fails
- `rmdir` only removes empty folders; use `rm -rf` for the whole tree
- recharts 3.x: prefer default Tooltip/axis behavior. Custom formatters trigger
  type errors (`ValueType | undefined`) — narrow inside the body, don't type the param
- `.txt` backups in `app/` are inert (not routes). `.js` siblings of `route.js` are NOT

## Completed

### Phases A–E — security hardening
- **A**: `lib/api-helpers.js`, `app/api/auth/logout/route.js`
- **B**: chat participation checks — `messages/[roomId]`, `mark-read`, `notifications/read`
- **C**: money flow — invest, withdrawal, admin status update. Balance checks,
  escrow model, optimistic locking (string-amount lock via exact-match filter)
- **D**: cleanup-sessions auth, ChatWidget auto-close removed, user/accounts whitelist,
  useSessionTracker fixes, track route rewrite
- **E**: password reset takeover closed. Admin-issued one-time SHA-256 code,
  15-min TTL, timing-safe compare, single-use. Files touched:
  `app/actions/admin.js` (added `issuePasswordResetToken`),
  `app/api/check-password-reset/route.js`,
  `app/api/change-password/route.js`,
  `app/components/LoginPasswordReset.tsx`,
  `app/components/Activator.tsx`,
  `app/components/AdminUserManager.tsx`
- **proxy.js**: header forwarding fixed (via `NextResponse.next({ request: { headers }})`),
  `isPublicRoute` uses segment-boundary matching (no more '/' matching everything)
- **lib/security.js**: duplicate `securityConfig` export removed

### Verified state
- All Server Action callers render on matcher-protected routes
  (`me/page.tsx`, `me/users/[userId]/page.tsx`)
- `AdminUserManager.tsx` is dead code (commented import in `me/page.tsx:12`)
- `AdminUserDashboardEditor.tsx` has a duplicate commented block (lines 1–378) —
  cosmetic cleanup pending
- Password reset end-to-end flow tested and working

## In progress — Phase G: Admin dashboard charts

**Requirements:** preserve existing logic + full responsiveness (mobile / tablet / desktop)

**Targets:**
- `AdminDashboard.tsx` — donut + line chart (checkpoints 1 & 2)
- `Tracker.tsx` — session status donut (checkpoint 3)

**NOT touching:**
- `DashboardContent.tsx` — has hand-rolled SVG charts already; recharts would make it worse
- `AutoBalanceAdmin.tsx` — control panel, not a report
- `AdminWithdrawalList.tsx` — deferred until requests exist

**Files (in order):**

| # | File | Status |
|---|------|--------|
| G1 | `app/components/charts/AnimatedCard.tsx` (new) | ✅ |
| G2 | `app/components/charts/UserHealthDonut.tsx` (new) | ✅ |
| G3 | `app/components/AdminDashboard.tsx` (edit — donut slot) | ✅ |
| G4 | `app/api/admin/stats/timeseries/route.js` (new) | ⬜ |
| G5 | `app/components/charts/UserGrowthLine.tsx` (new) | ⬜ |
| G6 | `app/components/AdminDashboard.tsx` (edit — line slot, 2-col grid) | ⬜ |
| G7 | `app/components/charts/SessionStatusDonut.tsx` (new) | ⬜ |
| G8 | `app/components/Tracker.tsx` (edit) | ⬜ |

**Checkpoint 1 (G1–G3)** ✅ — donut renders on `/me` between stat cards and tabs.

**Checkpoint 2 (G4–G6)** — timeseries endpoint + line chart. User Health section
becomes 2-col grid (line left ~2/3, donut right ~1/3).

**Checkpoint 3 (G7–G8)** — session status donut on Tracker.

## Next up — Phase H: Admin dashboard restyle (after G completes)

**Chosen style:** no sidebar. Keep cyan theme. Fix grid + card rhythm only.

**The problem:** `/me/page.tsx` currently stacks 6 components vertically, each with
its own `min-h-screen bg-[#C4F8FD]` wrapper. Reads like a scroll, not a dashboard.

**The fix:** strip outer wrappers, arrange in a proper grid:
- KPIs on top
- 2-column row (AdminDashboard + Tracker)
- 2-column row (AutoBalance + Activator)
- AdminWithdrawalList full width

**Planned files (5):**

| # | File | Change |
|---|------|--------|
| H1 | `app/me/page.tsx` | Grid layout |
| H2 | `app/components/AdminDashboard.tsx` | Strip outer wrapper |
| H3 | `app/components/Tracker.tsx` | Strip outer wrapper |
| H4 | `app/components/AutoBalanceAdmin.tsx` | Strip outer wrapper |
| H5 | `app/components/Activator.tsx` | Strip outer wrapper |

**Rule:** zero logic changes. Only outer container divs. Same tables, same
buttons, same handlers, same data.

## Remaining security (deferred, from original audit)
1. Phase F: JWT secret fallback guard in `lib/security.js`
2. Rate limiting on auth routes
3. `isStrongPassword` + `isValidUsername` enforced on register
4. `ensureUserIndexes()` called at startup
5. `admin.js`: stop trusting `x-user-role` header — re-verify session/JWT directly
6. Delete dead files: `ChatWidget.tsx` (one t), `.txt` backups, `AdminUserManager.tsx`

## Working style that works
- One file per message
- I give full file, user saves, we rebuild before next file
- No batches, no audits, no tier tables
- If a file needs to be seen first, user runs `cat <path>` and pastes
- Finish a phase before starting a new one — don't stack pauses
- Commit at end of each phase, not mid-phase
| G5 | `app/components/charts/UserGrowthLine.tsx` (new) | ✅ |
- If formatter return fails typecheck in recharts 3.x, append `as [string, string]`
| G6 | `app/components/AdminDashboard.tsx` (edit — 2-col grid: line + donut) | ✅ |

**Checkpoint 2 (G4–G6)** ✅ — timeseries endpoint + growth line chart render.
User Health section is now a 2-col grid: line (2/3) + donut (1/3) on desktop, stacked on mobile/tablet.
| G7 | `app/components/charts/SessionStatusDonut.tsx` (new) | ✅ |
| G7 | `app/components/charts/SessionStatusDonut.tsx` (new) | ✅ |
| G8 | `app/components/Tracker.tsx` (edit — session status chart) | ✅ |

**Checkpoint 3 (G7–G8)** ✅ — session status donut rendered above the sessions list in Tracker.
Phase G complete: 8/8 files.

## Next up — Phase H: restyle
See "Next up" section above for full plan.
## Phase G — ✅ complete
All 8 files done. Admin dashboard now shows:
- User Health donut (Active/Inactive/Locked)
- User Growth line chart (30-day signups)
- Session Status donut above Live User Activity

## Phase H — in progress
- H1: `app/components/AdminDashboard.tsx` — strip `min-h-screen`, make it a card ✅
- H2: `app/me/page.tsx` — grid layout ⬜ next

**Decision:** no sidebar. Keep cyan theme. Fix grid + card rhythm only.
**Rule:** zero logic changes. Only outer container divs.
## Remaining after G+H
1. Commit (nothing since Phase A is committed!)
2. Phase F: JWT_SECRET fallback guard in lib/security.js
3. H3: AutoBalanceAdmin rounded-2xl (one-line)
4. admin.js: stop trusting x-user-role header
5. Cleanup: delete ChatWidget.tsx (one t), AdminUserManager.tsx, .txt backups
6. Rate limiting + register validation + ensureUserIndexes at startup
## Bug fix — Phase C regression
- Phase C added a hardcoded KNOWN_ASSET_IDS whitelist to /api/user/dashboard/invest
  that rejected every assetId the client actually sends → 400 Unknown asset.
- Fixed by removing the whitelist. Asset ID is now sanitized (trim, lowercase, 50-char cap) but not whitelisted.
- Lesson: don't add whitelists for values the client legitimately controls without
  first checking what the client sends.
  ## Asset balance fix — part 1 (user side)
- Dash.tsx was reading `analysisNote` (admin-only field) for the Assets card.
  Investments[] were saved but never summed.
- Fixed by computing `assetTotal` from `investments.reduce((s, i) => s + i.amount, 0)`.
- Part 2 (pending): admin editor UI to add/edit/remove investments directly.
## Asset balance fix — part 2 (admin side) ✅
- `app/me/users/[userId]/page.tsx` rewritten with:
  - Investments CRUD handlers (add/update/delete)
  - `investments` explicitly included in handleSave payload
  - New "Manage Investments" section between Balance and Bills
  - Live total displayed with note "(this is what the user's Assets card shows)"
  - "Analysis Note" relabeled as legacy — Assets card no longer reads it
- Removed 400-line dead comment preamble + unused ArrowLeft import
- Full loop tested: user buys → admin sees/edits → user sees updated total
## Phase I — Admin dashboard redesign
Decisions: cyan cards #C4F8FD | expand to max-w-7xl (Option B) | keep AutoBalance list
File order:
1. app/me/page.tsx ✅ (layout + order)
2. app/components/AdminDashboard.tsx ✅ (cyan cards, stat redesign, logout, Recent Users → cards)
2b. app/me/page.tsx ✅ (sticky SectionNav with IntersectionObserver active highlighting)
3. app/components/Activator.tsx ⬜ next — table → user cards
4. app/components/Tracker.tsx ⬜ — session rows → compact cards
5. app/components/AutoBalanceAdmin.tsx ⬜ — summary + pills on top, keep list
6. app/components/AdminWithdrawalList.tsx ⬜ — card consistency

Section IDs (for nav): #admin-overview, #admin-users, #admin-activity, #admin-auto-balance, #admin-withdrawals
Rule: zero logic changes. Container/structure/styling only. -->

# Session Notes — ashtrust

## Project
Next.js 16 banking app. MongoDB (native driver). Dual auth (cookie session + JWT).
Roles: user + admin. Repo: ashtrust, branch: main.

## Build facts (locked in)
- next pinned to 16.2.12 (no caret)
- build script: `next build --webpack` (Turbopack has a prerender bug)
- `.env.local` must NOT contain NODE_ENV
- run from `~/Documents/ashtrust` (capital D) — case matters on Windows
- after file changes: `rm -rf .next && npm run build`
- do NOT leave empty `app/api/**/route.js` files — Next type-checks them and fails
- `rmdir` only removes empty folders; use `rm -rf` for the whole tree
- recharts 3.x: prefer default Tooltip/axis behavior. Custom formatters trigger
  type errors (`ValueType | undefined`) — narrow inside the body, don't type the param
- `.txt` backups in `app/` are inert (not routes). `.js` siblings of `route.js` are NOT

---

## Completed

### Phases A–E — Security hardening (committed as `ea75d19`)

- **A**: `lib/api-helpers.js`, `app/api/auth/logout/route.js`
- **B**: chat participation checks — `messages/[roomId]`, `mark-read`, `notifications/read`
- **C**: money flow — invest, withdrawal, admin status update. Balance checks,
  escrow model, optimistic locking (string-amount lock via exact-match filter)
- **D**: cleanup-sessions auth, ChatWidget auto-close removed, user/accounts whitelist,
  useSessionTracker fixes, track route rewrite
- **E**: password reset takeover closed. Admin-issued one-time SHA-256 code,
  15-min TTL, timing-safe compare, single-use. Files:
  `app/actions/admin.js`, `app/api/check-password-reset/route.js`,
  `app/api/change-password/route.js`, `app/components/LoginPasswordReset.tsx`,
  `app/components/Activator.tsx`, `app/components/AdminUserManager.tsx`
- **proxy.js**: header forwarding fixed (via `NextResponse.next({ request: { headers }})`),
  `isPublicRoute` uses segment-boundary matching
- **lib/security.js**: duplicate `securityConfig` export removed

### Phase C regression fix — asset whitelist
- Phase C added a hardcoded `KNOWN_ASSET_IDS` whitelist to
  `/api/user/dashboard/invest` that rejected every assetId the client sends.
- Fixed by removing the whitelist. Asset ID is now sanitized
  (trim, lowercase, 50-char cap) but not whitelisted.
- **Lesson:** don't add whitelists for values the client legitimately controls
  without checking what the client actually sends.

### Phase G — Admin dashboard charts ✅ (8/8 files)

| # | File | Purpose |
|---|------|---------|
| G1 | `app/components/charts/AnimatedCard.tsx` (new) | shared framer-motion wrapper |
| G2 | `app/components/charts/UserHealthDonut.tsx` (new) | Active/Inactive/Locked donut |
| G3 | `app/components/AdminDashboard.tsx` (edit) | donut slot |
| G4 | `app/api/admin/stats/timeseries/route.js` (new) | 30-day signups endpoint |
| G5 | `app/components/charts/UserGrowthLine.tsx` (new) | growth line chart |
| G6 | `app/components/AdminDashboard.tsx` (edit) | 2-col grid: line (2/3) + donut (1/3) |
| G7 | `app/components/charts/SessionStatusDonut.tsx` (new) | active/ended sessions |
| G8 | `app/components/Tracker.tsx` (edit) | session status donut above list |

**NOT touched:** `DashboardContent.tsx` (has hand-rolled SVG charts), `AutoBalanceAdmin.tsx`.

### Asset balance fix

**Part 1 (user side):** `Dash.tsx` was reading `analysisNote` (admin-only field)
for the Assets card. Fixed — now computes `assetTotal` from
`investments.reduce((s, i) => s + i.amount, 0)`.

**Part 2 (admin side):** `app/me/users/[userId]/page.tsx` updated with:
- Investments CRUD handlers (add/update/delete)
- `investments` explicitly in handleSave payload
- New "Manage Investments" section between Balance and Bills
- Live total display
- "Analysis Note" relabeled as legacy

Full loop tested: user buys → admin sees/edits → user sees updated total.

### Login-block modal feature ✅

Admin can set a per-user "Login Block Message" + "Contact Email". If that user
is later deactivated or locked, login shows a modal with either the custom
message or a fallback "contact support" message with the email.

**Files:**
- `lib/db/users.js` — added `loginBlockMessage`, `loginBlockContactEmail` to
  `updateUser` whitelist
- `app/api/auth/login/route.js` — added GATE 1 (locked, 423) and
  GATE 2 (inactive, 403, after password check). Both return
  `reason`, `blockMessage`, `contactEmail`
- `app/components/AccountBlockedModal.tsx` (new) — two-branch modal
- `app/components/Logge.tsx` — detects `reason`, shows modal
- `app/actions/admin.js` — added `getUserLoginBlock`, `updateUserLoginBlock`
  (writes to **users** collection, not dashdata)
- `app/me/users/[userId]/page.tsx` — amber "Login Block Message" panel + handlers

### Forgot-password modal ✅

`app/forgot-password/page.tsx` "Password Reset Not Enabled" modal:
- Phone row removed
- Email reads from `loginBlockContactEmail` (fallback to
  `NEXT_PUBLIC_SUPPORT_EMAIL` or `support@ashtrust.com`)
- `app/api/check-password-reset/route.js` now returns
  `loginBlockContactEmail` in the response

### Phase I — Admin dashboard redesign

**Decisions:** cyan cards `#C4F8FD` | expand to `max-w-7xl` | keep AutoBalance list

**Nav architecture:**
- Desktop (≥1024px): hamburger drawer — `app/components/DesktopNav.tsx`
- Mobile/tablet (<1024px): bottom nav — `app/components/Iconpack.tsx`
- Both use `/me`-aware section tabs (`isSection` flag → smooth scroll)
- Section IDs: `#admin-overview`, `#admin-users`, `#admin-activity`,
  `#admin-auto-balance`, `#admin-withdrawals`

**Drawer extras:** Log out + Refresh buttons (desktop only).
Refresh uses `window.dispatchEvent(new CustomEvent('admin:refresh'))` —
`AdminDashboard.tsx` listens and calls `fetchAllData` via `useCallback` wrapper.
The AdminDashboard header buttons are `lg:hidden` (mobile/tablet only).

| # | File | Status |
|---|------|--------|
| 1 | `app/me/page.tsx` | ✅ grid layout + section IDs |
| 2 | `app/components/AdminDashboard.tsx` | ✅ cyan cards, stat redesign, logout, Recent Users → cards, header actions |
| 3 | `app/components/DesktopNav.tsx` | ✅ hamburger drawer with `/me`-aware section tabs + logout/refresh |
| 4 | `app/components/Iconpack.tsx` | ✅ `md:hidden` → `lg:hidden`, `/me`-aware section tabs |
| 5 | `app/components/Activator.tsx` | ⬜ next — table → user cards |
| 6 | `app/components/Tracker.tsx` | ⬜ session rows → compact cards |
| 7 | `app/components/AutoBalanceAdmin.tsx` | ⬜ summary + pills top, keep list |
| 8 | `app/components/AdminWithdrawalList.tsx` | ⬜ card consistency |

**Rule:** zero logic changes. Container/structure/styling only.

---

## Remaining work (in priority order)

### Security (deferred)
1. **Phase F:** JWT secret fallback guard in `lib/security.js` —
   currently falls back to `'your-secret-key'` if env vars missing
2. Rate limiting on auth routes (login, register, check-user, change-password)
3. `isStrongPassword` + `isValidUsername` enforced on `/api/auth/register`
4. `ensureUserIndexes()` called at startup (currently never called)
5. `admin.js`: stop trusting `x-user-role` header — re-verify session/JWT directly

### Cleanup
6. Delete dead files: `ChatWidget.tsx` (one t), `AdminUserManager.tsx`
   (commented import in `me/page.tsx:12`), `.txt` backups
7. `AdminUserDashboardEditor.tsx` has a duplicate commented block (lines 1–378)

### Phase I continuation
8. Files 5–8 above (Activator, Tracker, AutoBalance, WithdrawalList restyle)

---

## Known inconsistencies (fine for testing)
- Assets card reads `investments.reduce(...)` in `Dash.tsx`
- Admin editor still has legacy "Analysis Note (for Assets card)" field
- `dashdata.loginBlockMessage` may have stale copies alongside the canonical
  `users.loginBlockMessage`
- `PasswordResetNotEnabledModal` phone env var (`NEXT_PUBLIC_SUPPORT_PHONE`)
  is now unused — harmless

## Working style
- One file per message
- Full file paste, save, rebuild before next file
- No batches, no audits, no tier tables
- If a file needs to be seen first: `cat <path>` and paste
- Finish a phase before starting a new one
- Commit at end of each phase, not mid-phase
# Session Notes — ashtrust

## Project
Next.js 16 banking app. MongoDB (native driver). Dual auth (cookie session + JWT).
Roles: user + admin. Repo: ashtrust, branch: main.

## Build facts (locked in)
- next pinned to 16.2.12 (no caret)
- build script: `next build --webpack` (Turbopack has a prerender bug)
- `.env.local` must NOT contain NODE_ENV
- run from `~/Documents/ashtrust` (capital D) — case matters on Windows
- after file changes: `rm -rf .next && npm run build`
- do NOT leave empty `app/api/**/route.js` files — Next type-checks them and fails
- `rmdir` only removes empty folders; use `rm -rf` for the whole tree
- recharts 3.x: prefer default Tooltip/axis behavior. Custom formatters trigger
  type errors (`ValueType | undefined`) — narrow inside the body, don't type the param
- `.txt` backups in `app/` are inert (not routes). `.js` siblings of `route.js` are NOT

---

## Completed

### Phases A–E — Security hardening (committed as `ea75d19`)
- **A**: `lib/api-helpers.js`, `app/api/auth/logout/route.js`
- **B**: chat participation checks — `messages/[roomId]`, `mark-read`, `notifications/read`
- **C**: money flow — invest, withdrawal, admin status update. Balance checks,
  escrow model, optimistic locking (string-amount lock via exact-match filter)
- **D**: cleanup-sessions auth, ChatWidget auto-close removed, user/accounts whitelist,
  useSessionTracker fixes, track route rewrite
- **E**: password reset takeover closed. Admin-issued one-time SHA-256 code,
  15-min TTL, timing-safe compare, single-use. Files:
  `app/actions/admin.js`, `app/api/check-password-reset/route.js`,
  `app/api/change-password/route.js`, `app/components/LoginPasswordReset.tsx`,
  `app/components/Activator.tsx`, `app/components/AdminUserManager.tsx`
- **proxy.js**: header forwarding fixed, `isPublicRoute` uses segment-boundary matching
- **lib/security.js**: duplicate `securityConfig` export removed

### Phase C regression fix — asset whitelist
- Removed hardcoded `KNOWN_ASSET_IDS` from `/api/user/dashboard/invest`.
  Asset ID is now sanitized (trim, lowercase, 50-char cap) but not whitelisted.
- **Lesson:** don't whitelist values the client legitimately controls without
  checking what the client actually sends.

### Phase G — Admin dashboard charts ✅ (8/8)
- G1 `charts/AnimatedCard.tsx` (new) — shared framer-motion wrapper
- G2 `charts/UserHealthDonut.tsx` (new) — Active/Inactive/Locked
- G3 `AdminDashboard.tsx` — donut slot
- G4 `api/admin/stats/timeseries/route.js` (new) — 30-day signups
- G5 `charts/UserGrowthLine.tsx` (new)
- G6 `AdminDashboard.tsx` — 2-col grid: line (2/3) + donut (1/3)
- G7 `charts/SessionStatusDonut.tsx` (new)
- G8 `Tracker.tsx` — session status donut above list

### Asset balance fix
- **User side:** `Dash.tsx` computes `assetTotal` from
  `investments.reduce((s, i) => s + i.amount, 0)` — no longer reads `analysisNote`
- **Admin side:** `app/me/users/[userId]/page.tsx` — Investments CRUD,
  `investments` in `handleSave` payload, "Manage Investments" section between
  Balance and Bills. Full loop tested.

### Login-block modal ✅
- Admin sets per-user "Login Block Message" + "Contact Email"
- Login route returns `reason`, `blockMessage`, `contactEmail` on 423/403
- `AccountBlockedModal.tsx` (new), detected by `Logge.tsx`
- `lib/db/users.js` — added fields to `updateUser` whitelist
- `app/actions/admin.js` — `getUserLoginBlock`, `updateUserLoginBlock`
  (writes to **users** collection)
- `app/me/users/[userId]/page.tsx` — amber panel + handlers

### Forgot-password modal ✅
- `app/forgot-password/page.tsx` — phone row removed, email from
  `loginBlockContactEmail` (fallback `NEXT_PUBLIC_SUPPORT_EMAIL` → `support@ashtrust.com`)
- `app/api/check-password-reset/route.js` — returns `loginBlockContactEmail`

### DynamicEye — admin notification eye ✅
- `app/components/DynamicEye.tsx` — 3-level drill-down (users → user → single),
  polls `/api/admin/notifications` every 5s, sound + mute, notch position picker,
  self-gates on `localStorage.user.role === 'admin'`
- **`app/layout.tsx` — mounts `<DynamicEye />` globally** in `<body>`
  (import: `@/app/components/DynamicEye`, default export, no props)
- `PERSISTENT_TYPES` includes `message` — chat rows persist on close

### Login-failure notifications ✅
- `lib/db/notifications.js` — added types: `login_failed`, `login_blocked`,
  `login_inactive` + labels ("Wrong password", "Blocked sign-in attempt",
  "Deactivated account attempt")
- `app/api/auth/login/route.js` — 3 new hooks (blocked / failed / inactive) +
  shared `notifyBase` payload. Success-path `login` hook preserved.
  All hooks wrapped in try/catch — never break the login response.
- Coalescing via `createOrBumpNotification` (same userId + type bumps count,
  no row flood). Unknown emails still skip — no user record to key on.

### Phase I — Admin dashboard redesign

**Decisions:** cyan cards `#C4F8FD` | `max-w-7xl` | keep AutoBalance list

**Nav:**
- Desktop (≥1024px): `DesktopNav.tsx` hamburger drawer — section tabs + logout/refresh
- Mobile/tablet (<1024px): `Iconpack.tsx` bottom nav
- Section IDs: `#admin-overview`, `#admin-users`, `#admin-activity`,
  `#admin-auto-balance`, `#admin-withdrawals`
- Refresh via `window.dispatchEvent(new CustomEvent('admin:refresh'))`

| # | File | Status |
|---|------|--------|
| 1 | `app/me/page.tsx` | ✅ grid layout + section IDs |
| 2 | `app/components/AdminDashboard.tsx` | ✅ cyan cards, stat redesign, logout, Recent Users → cards |
| 3 | `app/components/DesktopNav.tsx` | ✅ hamburger drawer |
| 4 | `app/components/Iconpack.tsx` | ✅ `lg:hidden` bottom nav |
| 5 | `app/components/Activator.tsx` | ✅ table → user cards (grid, `Lock`/`Unlock` swap) |
| 6 | `app/components/Tracker.tsx` | ⬜ session rows → compact cards |
| 7 | `app/components/AutoBalanceAdmin.tsx` | ⬜ summary + pills top, keep list |
| 8 | `app/components/AdminWithdrawalList.tsx` | ⬜ card consistency |

**Rule:** zero logic changes. Container/structure/styling only.

---

## Remaining work (priority order)

### Phase I continuation
1. File 6 — `Tracker.tsx` session rows → compact cards
2. File 7 — `AutoBalanceAdmin.tsx` summary + pills top, keep list
3. File 8 — `AdminWithdrawalList.tsx` card consistency

### Security (deferred)
4. **Phase F:** JWT secret fallback guard in `lib/security.js` —
   currently falls back to `'your-secret-key'`
5. Rate limiting on auth routes (login, register, check-user, change-password)
6. `isStrongPassword` + `isValidUsername` enforced on `/api/auth/register`
7. `ensureUserIndexes()` called at startup (currently never called)
8. `admin.js`: stop trusting `x-user-role` header — re-verify session/JWT directly

### Cleanup
9. Delete dead files: `ChatWidget.tsx` (one t), `AdminUserManager.tsx`,
   `.txt` backups
10. `AdminUserDashboardEditor.tsx` — duplicate commented block (lines 1–378)

### Commit
11. **Nothing committed since Phase A.** Phase G + H/Phase I work + DynamicEye
    + login notifications are all uncommitted.

---

## Known inconsistencies (fine for testing)
- Assets card reads `investments.reduce(...)` in `Dash.tsx`
- Admin editor still has legacy "Analysis Note" field
- `dashdata.loginBlockMessage` may have stale copies alongside canonical
  `users.loginBlockMessage`
- `PasswordResetNotEnabledModal` `NEXT_PUBLIC_SUPPORT_PHONE` env var unused

## Working style
- One file per message
- Full file paste, save, rebuild before next file
- No batches, no audits, no tier tables
- If a file needs to be seen first: `cat <path>` and paste
- Finish a phase before starting a new one
- Commit at end of each phase, not mid-phase