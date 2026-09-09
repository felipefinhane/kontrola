# Kontrola

A calm, judgment-free personal finance tracker — starts as a single-user bank-account ledger, grows toward credit cards and shared accounts.

> Working name — see [`docs/analise-inicial.md`](docs/analise-inicial.md) for why.

## Where things live

- [`CONTEXT.md`](CONTEXT.md) — domain glossary, the source of truth for terminology
- [`docs/adr/`](docs/adr/) — architecture decisions and why they were made
- [`docs/analise-inicial.md`](docs/analise-inicial.md) — the original spreadsheet analysis that started this project
- [`docs/stitch-prompt.md`](docs/stitch-prompt.md) / [`docs/stitch-export/`](docs/stitch-export/) — UI design prompts and the generated screens
- [`src/db/schema.ts`](src/db/schema.ts) — the data model, implementing `CONTEXT.md`'s entities

## Stack

Next.js (App Router, TypeScript, Tailwind v4) + PWA · Postgres via `pg`/Drizzle ORM, Neon in production · Auth.js (Credentials + JWT) · next-intl (EN/PT-BR) · next-themes (Light/Dark/System) · Vercel — see the ADRs for why each one.

## Local development

```bash
cp .env.example .env      # fill in the secrets (openssl rand -base64 32 for the two key ones)
docker-compose up -d db   # first: local Postgres, so the app has something to connect to
npm install
npm run db:migrate        # creates tables + RLS policies (uses DATABASE_ADMIN_URL)
npm run db:seed           # default Categories (Housing, Food, Transport, ...)
npm run dev                # or: docker-compose up (runs the whole stack, app included)
```

- `app` — the Next.js dev server, http://localhost:3000
- `db` — Postgres, mirroring the shape of the Neon production database, plus a restricted `kontrola_app` role the app actually connects as (`docker/initdb/01-app-role.sql`) so Row Level Security ([ADR-0002](docs/adr/0002-rls-for-multi-tenant-isolation.md)) is genuinely exercised locally, not just in production
- `adminer` — DB inspector UI, http://localhost:8080 (system: PostgreSQL, server: `db`, user/password/database: `kontrola` — the admin role, for full visibility)

Production uses Vercel + Neon directly ([ADR-0001](docs/adr/0001-neon-over-supabase.md), [ADR-0009](docs/adr/0009-plain-pg-driver-not-neon-serverless.md)) — docker-compose is dev-only ([ADR-0006](docs/adr/0006-docker-compose-for-local-dev.md)).

### Database scripts

- `npm run db:generate` — diff `src/db/schema.ts` against the last migration, write a new one
- `npm run db:migrate` — apply pending migrations (`DATABASE_ADMIN_URL`, needs CREATE privilege)
- `npm run db:seed` — insert the default Categories if they're not already there
- `npm run db:studio` — Drizzle's own DB browser, alternative to Adminer

> **RLS gotcha, if you ever regenerate the migration from scratch:** Postgres doesn't restrict a table's *owner* by policy alone, even with RLS enabled — `FORCE ROW LEVEL SECURITY` closes that gap, but drizzle-kit doesn't express it. The generated `drizzle/0000_*.sql` has it hand-added for all 6 tables; re-add it if you ever wipe and regenerate. See the comment above `currentUserId` in `src/db/schema.ts`.
>
> **RLS gotcha #2, if you ever provision a fresh Neon project:** `FORCE ROW LEVEL SECURITY` alone is *not* enough — Neon's default owner role has the separate `BYPASSRLS` grant, which ignores RLS regardless of FORCE. The app must run as its own restricted role there too, same as local dev's `kontrola_app` (`docker/initdb/01-app-role.sql`) — see [ADR-0011](docs/adr/0011-neon-needs-its-own-restricted-role.md) for the exact grants and how this was discovered.

## Status

All 17 MVP tasks in [`docs/TASKS.md`](docs/TASKS.md) are done — every screen listed there is built, and `docs/TASKS.md`'s own "Post-MVP fixes" section tracks bugs found after the fact on the deployed app. What's *not* in the MVP:

- **v1.1**: `RecurringTemplate` (auto-generating a `planned` Transaction from a recurring schedule) and the inactivity-nudge cron job — [ADR-0010](docs/adr/0010-vercel-cron-for-scheduled-jobs.md) records the mechanism (Vercel Cron), neither job exists yet, no `vercel.json`/`/api/cron/*`.
- **v2**: `CreditCard` as its own tracked entity (statement cycle, due date, limit).
- **v3**: `AccountMember` / sharing an Account between Users.
- **Sending** push notifications — [#15](docs/TASKS.md) built subscription registration and the receiving service worker; nothing calls the Web Push API to actually send one yet (that's the same v1.1 cron job above, once it exists).

Known, disclosed gaps in what *is* built (each documented in more depth at its own `docs/TASKS.md` entry):

- **`RESEND_API_KEY` isn't set in production yet** — #16 Forgot Password's email-sending half is unverified end-to-end until it is.
- **No graceful fallback for an undecryptable Transaction field** — found during #7: one bad `description`/`note` (e.g. an encryption-key mismatch) 500s the whole page reading it, rather than degrading that one row.
- **Direct-`onClick` Server Action calls** (theme, default currency, inactivity-days stepper — #13/#15) and anything needing real browser Push APIs or iOS's `navigator.standalone` (#15) were never exercised by an actual browser — this sandbox doesn't have one, so these are type/lint-correct but not runtime-verified.
- **A User's locale/theme preference doesn't follow them to a new browser on login** — #13 made `users` the source of truth and Settings writes it, but sign-in doesn't yet pull those values back into a fresh session's cookie/`localStorage`.
