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

> **RLS gotcha, if you ever regenerate the migration from scratch:** Postgres doesn't restrict a table's *owner* by policy alone, even with RLS enabled — `FORCE ROW LEVEL SECURITY` closes that gap, but drizzle-kit doesn't express it. The generated `drizzle/0000_*.sql` has it hand-added for all 5 tables; re-add it if you ever wipe and regenerate. See the comment above `currentUserId` in `src/db/schema.ts`.

## Known gaps (parked for later)

- **Dark mode / safe-area only cover 6 of 27 Stitch screens** — the design is unified and documented ([`docs/kontrola-calm-control-DESIGN.md`](docs/kontrola-calm-control-DESIGN.md)); safe-area itself is already implemented for real in `src/app/layout.tsx` + `globals.css`, independent of Stitch's coverage. Full details and ready-to-paste Stitch prompts for the rest of the screens in [`docs/stitch-export/INDEX.md`](docs/stitch-export/INDEX.md).
- **Only Onboarding is built** (`src/app/page.tsx`, `docs/stitch-export/01-onboarding.html`) — every other screen in `docs/stitch-export/` still needs to be turned into real Next.js pages/components. See `docs/TASKS.md` for the order.
- **Auth.js has no real sign-up flow yet** — `src/auth.ts` can log a user in (Credentials provider checks `password_hash` via bcrypt) but nothing creates that first row yet.
