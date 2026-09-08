# Tasks

Plano de execução do MVP, na ordem de dependência real. Fonte de verdade — o `TaskList` (task tool) é escopado por *sessão* do Claude Code, não por projeto, e não sobrevive a um `/clear` ou sessão nova. Este arquivo sobrevive.

**Como usar**: ao começar uma task, marque `[~]`; ao terminar, `[x]` e mova o commit relevante para a nota. Se quiser espelhar isso no task tool durante uma sessão de trabalho, tudo bem — mas atualize aqui também antes de encerrar.

## Grafo de dependências

```
#1  Onboarding                    (livre)
#2  Sign Up                       (livre)
#3  Log In                        (livre)
#4  Auth middleware                ← #3
#5  Accounts (data + Add)          ← #4
#6  Accounts List + Empty State    ← #4
#7  Account Detail                 ← #4
#8  Categories                     ← #4
#9  Transactions (data + Add/Edit) ← #5, #8
#10 Transactions List              ← #9
#11 Planned view                   ← #9
#12 Home Dashboard                 ← #6, #10
#13 Settings persist               ← #4
#14 Change Password                ← #4
#15 Push notifications             ← #4
#16 Forgot Password (decisão)      (livre, mas precisa decidir provedor de email antes de construir)
#17 Vercel env vars + Neon prod DB (livre, mas bloqueia deploy funcional em produção)
```

## Lista

- [x] **#1 Build real Onboarding screen**
  Replaced the placeholder `src/app/page.tsx` with the real screen from `docs/stitch-export/01-onboarding.html`: logo, tagline, "Get Started" -> /signup, "I already have an account" -> /login (both routes still 404 until #2/#3), and the "Add to Home Screen" callout (inline SVG icon, no new icon-library dependency). Added the two missing Onboarding message keys (`addToHomeScreenTitle`, `addToHomeScreenInstruction`) to en/pt-BR. Uses the existing `globals.css` tokens only, so it gets dark mode for free even though 01-onboarding.html itself has no dark variant.

- [x] **#2 Build Sign Up (server action + screen)**
  `src/app/signup/{page,signup-form,actions}.tsx` from `docs/stitch-export/02-sign-up.html` (mobile layout only, same call as #1 — desktop marketing panel is decorative fluff not worth porting). `src/lib/validation.ts` holds the real server-side password rule (8 chars, a number, a symbol — binary pass/fail, so the Stitch 3-bar strength meter got dropped in favor of the static hint) and email format check, reusable by #14 Change Password. Action hashes with bcryptjs (12 rounds), inserts via plain `db` (no `withUserContext` — `users_insert_for_signup` policy covers it), catches the unique-email race via Postgres error code 23505 rather than a pre-check SELECT, then calls `signIn()` — success redirects to `/` (the only non-404 destination today; #4/#12 will give authenticated users somewhere better to land). `tsc`/`eslint`/`next build` all clean; **not** verified against a live Postgres — no Docker socket access in this sandbox, so the signup→insert→signIn round-trip is unverified. Do that before relying on it.

- [x] **#3 Build Log In screen**
  `src/app/login/{page,login-form,actions}.tsx` from `docs/stitch-export/03-log-in.html` (centered card layout, matching the source — different from #2's full-bleed page). Same `useActionState` + `AuthError`-catching pattern as #2. One generic "incorrect email or password" message regardless of whether the email exists (no user enumeration). Links to Sign Up and to Forgot Password (`/forgot-password` — 404s until #16). Extracted the icon SVGs #2 had inlined into `src/components/icons.tsx`, shared by both screens now (and by #14 Change Password later).

  **Actually verified against live Neon this time** (unlike #2, which shipped untested — Docker wasn't available then; a real `DATABASE_URL` exists now via #17): ran `next dev` against production Neon and drove the real server actions with raw `fetch`/`FormData` POSTs (Next's no-JS progressive-enhancement form encoding — no browser needed). Confirmed sign-up → auto-login → redirect, login with right/wrong password, weak-password rejection, and duplicate-email rejection, all against real inserts/selects through RLS. **Found and fixed a real bug this uncovered**: `isUniqueViolation` in `src/app/signup/actions.ts` checked `err.code`, but drizzle-orm wraps the underlying pg error in its own `DrizzleQueryError` — the actual Postgres error code lives at `err.cause.code`, not on the error itself. Duplicate signups were hitting an uncaught 500 instead of the graceful "email already exists" message. Fixed and re-verified live; all 4 test users cleaned up from Neon after.

- [ ] **#4 Add auth middleware to protect app routes** — blocked by #3
  `src/middleware.ts` using `src/auth.ts`'s `auth` — redirect unauthenticated requests to /login for every route except onboarding/signup/login/forgot-password and static assets. Needed before any of the real (session-scoped) screens can be tested end to end.

- [ ] **#5 Accounts: data layer + Add Account screen** — blocked by #4
  `src/db/queries/accounts.ts` (or similar): create/list/get, all through `withUserContext` (`src/db/index.ts`) — never raw `db` calls outside auth. Screen: `docs/stitch-export/09-add-account.html` (nickname, bank name picker, currency, opening balance -> creates the account plus a seed `actual` credit Transaction for the opening balance, per `CONTEXT.md`'s "Balance is always derived, never stored").

- [ ] **#6 Accounts List + Empty State screens** — blocked by #4
  `docs/stitch-export/07-accounts-list.html` and `13-accounts-empty-state.html`. Total Balance card groups by currency per ADR-0007 (never sums across currencies) — 07 is already the corrected version from Stitch, use it as the visual reference.

- [ ] **#7 Account Detail screen** — blocked by #4
  `docs/stitch-export/08-account-detail.html` — account header (balance, currency, bank) + that account's own transaction list. "Transfer"/"Pay" buttons in the design stay non-functional for now (v4/v2 scope per `CONTEXT.md` and `docs/analise-inicial.md` roadmap) — decide in this task whether to hide them or leave visually present but disabled.

- [ ] **#8 Categories: data layer + screen** — blocked by #4
  List system-default + user's own custom categories (already seeded via `npm run db:seed`), create-custom-category flow. Screen: `docs/stitch-export/10-categories.html`. Note the known gap from the design review: mockup category names (Groceries, Bills, Dining...) don't match the official 9-item list in `CONTEXT.md` — decide here whether to expand the default catalog or keep the 9.

- [ ] **#9 Transactions: data layer + Add/Edit Transaction screen** — blocked by #5, #8
  Create/update Transaction through `withUserContext`, description+note encrypted via `src/lib/crypto.ts` before insert (ADR-0003), amount/currency taken from the selected Account. Screen: `docs/stitch-export/05-add-edit-transaction.html` (already has the R$ fix applied).

- [ ] **#10 Transactions List screen** — blocked by #9
  `docs/stitch-export/06-transactions-list.html` (R$ fix already applied) — date-grouped list, filter chips (Account/Category/Status), planned rows in the dashed/amber treatment.

- [ ] **#11 Planned view screen** — blocked by #9
  `docs/stitch-export/11-planned-view.html`. Open question to resolve here: RecurringTemplate (the only planned-Transaction generator we've designed) is v1.1, not built yet — decide whether MVP lets a User manually create a `status: planned` Transaction directly (the original spreadsheet's manual forecast months suggest yes), or whether this screen stays empty until v1.1 ships.

- [ ] **#12 Home Dashboard screen** — blocked by #6, #10
  `docs/stitch-export/04-home-dashboard.html` (R$ fix + currency grouping already applied) — aggregate balance grouped by currency (ADR-0007), horizontally-scrollable account cards, recent actual transactions, empty state, FAB to Add Transaction.

- [ ] **#13 Settings: persist preferences + screen** — blocked by #4
  Wire language/theme/default-currency to the `users` table (columns already exist) instead of only next-themes' localStorage / next-intl's cookie — decide the sync direction (DB as source of truth, cookie/localStorage as a fast-read cache) in this task. Screen: `docs/stitch-export/14-settings.html`.

- [ ] **#14 Change Password screen** — blocked by #4
  `docs/stitch-export/14b-change-password.html` — verify current password, apply the same server-side strength rule as Sign Up, update `password_hash`.

- [ ] **#15 Push notifications: subscription registration + Notification Settings screen** — blocked by #4
  Service worker registration + browser Push subscription -> POST to an API route that stores it in `push_subscriptions` (this grilling round's new table). Screen: `docs/stitch-export/12-notification-settings.html` (push toggle, inactivity-days stepper, iOS install-status indicator). Sending the actual notifications is separate (ADR-0010, not built yet).

- [ ] **#16 Forgot Password flow — needs a decision first**
  `docs/stitch-export/03b-forgot-password.html` exists but sending a reset email needs an email provider, which hasn't been decided (no ADR, nothing in `.env.example`). Before building: decide the provider (e.g. Resend, since it's the common Vercel-ecosystem pick) or explicitly defer this screen past MVP.

- [x] **#17 Vercel env vars + Neon production DB**
  Vercel project `finhane/kontrola` linked to `github.com/felipefinhane/kontrola`, auto-deploys on push to `main`. All 5 env vars set on Production: `DATABASE_URL` (Neon pooled connection string, `sa-east-1`, set by the user directly as a **Secret** type — irrecoverable via `vercel env pull`, by design, so migrations/seed had to run from a session that had it in a local untracked `.env`, not pulled from Vercel); `AUTH_SECRET`, `FIELD_ENCRYPTION_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` generated and set via `vercel env add --type config`. Migrations applied and seed run against Neon — all 6 tables exist with `relrowsecurity`/`relforcerowsecurity` both `true` (verified directly via `pg_class`, so ADR-0002's owner-bypass gotcha is confirmed closed on Neon too), 9 default Categories seeded.

  **Known issue**: `npm run db:migrate` (the documented script, wraps `drizzle-kit migrate`) hangs on Neon and exits 1 with no error message — its spinner appears to swallow the real error. Worked around by calling `drizzle-orm/node-postgres/migrator`'s `migrate()` directly from a throwaway script instead. Not yet root-caused — works fine against local docker-compose Postgres per the original README instructions, only reproduces against Neon so far. If this resurfaces, try `drizzle-kit migrate --verbose` or piping through `cat` to defeat the TTY spinner before debugging further.

  **Also note**: local `.env` still has `DATABASE_ADMIN_URL` pointing at local docker (from `cp .env.example .env`), and `src/db/seed.ts`/`drizzle.config.ts` both prefer it over `DATABASE_URL` — fine for local dev, but means seeding/migrating Neon from a machine with `.env` set up for local docker needs that variable out of the way for that one call (e.g. `DOTENV_CONFIG_PATH` pointed at a file with only `DATABASE_URL`), not just `DATABASE_URL` present.
