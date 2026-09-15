# Session Notes — [date]

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
