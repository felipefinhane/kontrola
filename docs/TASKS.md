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

- [x] **#4 Add auth middleware to protect app routes** — blocked by #3
  `src/proxy.ts`, not `src/middleware.ts` — Next.js 16 renamed the convention (file *and* exported function, `middleware` -> `proxy`) after this task list was written; see the file's own top comment and `node_modules/next/dist/docs/.../upgrading/version-16.md`. Wraps `src/auth.ts`'s `auth()` around a check against an explicit `PUBLIC_ROUTES` allowlist (`/`, `/signup`, `/login`, `/forgot-password`) — default-deny, so every screen #5 onward is automatically protected without touching this file again; only a new *public* route needs an addition here. `matcher` skips `/api/auth/*`, Next internals, and anything with a file extension (icons, manifest, favicon — so PWA assets load pre-login), rather than hand-listing each static file.

  Verified live against Neon the same way as #3: unauthenticated requests to public routes get 200, to not-yet-built protected routes (`/accounts`, `/dashboard`, `/settings`) get a 307 to `/login`; a freshly signed-up session's cookie replayed against `/accounts` gets a normal 404 (route doesn't exist yet, but critically *not* the auth redirect) confirming the pass-through path works, not just the block path. `/api/auth/session` and static assets confirmed reachable with no session. Test user cleaned up after.

- [x] **#5 Accounts: data layer + Add Account screen** — blocked by #4
  `src/db/queries/accounts.ts`: `createAccount`/`listAccounts`/`getAccount`/`getUserDefaultCurrency`, all through `withUserContext`, no manual `.where(userId)` anywhere — RLS (`accounts_owner_only`) already scopes every row once `app.user_id` is set, and adding a redundant filter would contradict `src/db/index.ts`'s own stated intent for `withUserContext`. Screen: `src/app/accounts/new/{page,add-account-form,actions}.tsx` from `docs/stitch-export/09-add-account.html` — hero opening-balance input with a live currency picker (pre-filled from `users.defaultCurrency`, per `CONTEXT.md`), nickname, and a bank-name field with 3 quick-pick chips (Nubank/Itaú/Bradesco, matching the mockup) that just fill the free-text input, since `bankName` is deliberately not an enum. Opening balance > 0 seeds one `actual` `credit` Transaction (description encrypted, translated via `getTranslations` since a Server Action has no React tree); balance left empty/0 creates the Account with zero Transactions rather than a pointless R$0.00 row. Currency picker capped at the 3 codes the Stitch mockup shows (`src/lib/currency.ts`) — not full ISO 4217, matching ADR-0007's "today's data is 100% BRL." `/accounts` (#6) doesn't exist yet — same forward-link pattern as #1-#4, both the back button and the post-save redirect 404 until #6 lands. Added `EditIcon`/`BankIcon`/`SearchIcon`/`ChevronDownIcon`/`ArrowLeftIcon`/`CheckIcon` to `src/components/icons.tsx`.

  Verified live against Neon: signed up a test user, GET'd the form (confirmed the currency `<select>` pre-fills from the new user's default `BRL`), then POSTed real creates — opening balance 1500.50/BRL/Nubank produced an Account row plus exactly one Transaction (`amount: 1500.50`, `direction: credit`, `status: actual`, description decrypts back to the translated "Opening balance"); empty-balance create produced an Account with **zero** Transactions (confirmed by count, not just absence of an error); empty-nickname submission returned the field error inline, no redirect. Test users (and their cascaded Accounts/Transactions) deleted after.

- [x] **#6 Accounts List + Empty State screens** — blocked by #4
  `src/app/accounts/page.tsx`, one route for both states (empty vs. populated) — that's how the Stitch export itself names them, "Accounts (Empty)" being a state of the List screen, not a separate flow. Total Balance groups by currency via the new `groupBalancesByCurrency` (`src/lib/currency.ts`) + `formatMoneyParts` (`src/lib/format-money.ts`, `Intl.NumberFormat.formatToParts` — locale-safe splitting of the hero card's large-integer/small-cents typographic treatment, doesn't assume "," or "." means decimal). `listAccountsWithBalances` (`src/db/queries/accounts.ts`) sums `actual` Transactions per Account in JS from two RLS-scoped queries rather than a SQL CASE/SUM, matching ADR-0003's "simple over clever at this data volume" call.

  First screen needing the shared bottom-tab shell (the Stitch exports' "Semantic Shell Mandate" — transactional screens like #2/#5 suppress it, everything else shows it) — extracted to `src/components/bottom-nav.tsx` now so #7/#10/#11/#12/#13 reuse it instead of reinventing it. Fixes the route contract for all 5 tabs up front: `/home` (#12), `/transactions` (#10), `/accounts` (this task), `/planned` (#11), `/settings` (#13) — a future task landing on a different path needs to update the nav file, not the other way around.

  Three things dropped from the mockup as "don't fabricate a feature/data we don't have," same discipline as #1/#2/#5: the profile-photo/notification-bell top bar (no avatar field on `users`, no in-app notification feed — only `push_subscriptions` device registration, #15) collapsed to a plain wordmark; per-account icon/accent-color variety and trending-up/down glyphs (no `type` column on `accounts`, no historical-balance-trend feature designed anywhere) collapsed to one consistent card style, with color only encoding something real — negative vs. non-negative balance.

  Verified live against Neon: fresh signup renders the empty state with its CTA; created a BRL and a USD account (opening balances 1000/200) and confirmed both appear with correctly grouped, correctly formatted per-currency totals; inserted a debit transaction directly (simulating what #9 will eventually do through the UI) to push a balance negative and confirmed both the arithmetic (100 credit − 500 debit = −400) and the `text-debit` color treatment. Test users cleaned up after.

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
