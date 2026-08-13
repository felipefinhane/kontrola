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
```

## Lista

- [ ] **#1 Build real Onboarding screen**
  Replace the placeholder `src/app/page.tsx` with the real screen from `docs/stitch-export/01-onboarding.html`: logo, tagline, "Get Started" -> /signup, "I already have an account" -> /login, and the iOS "Add to Home Screen" callout. Use the design tokens already in `globals.css`, next-intl's Onboarding messages (already have en/pt-BR strings).

- [ ] **#2 Build Sign Up (server action + screen)**
  `docs/stitch-export/02-sign-up.html`. Server action: validate email/password server-side (grilling decision: the "8 chars, a number, a symbol" hint becomes a real rule, not just UI), hash with bcryptjs, insert into `users` via the admin/unscoped `db` (no session exists yet — same reasoning as the login lookup in `src/auth.ts`), then sign the user in. No email verification (grilling decision, MVP scope).

- [ ] **#3 Build Log In screen**
  `docs/stitch-export/03-log-in.html`, wired to next-auth's `signIn()` with the Credentials provider already configured in `src/auth.ts`. Link to Sign Up and to Forgot Password.

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
