# Kontrola

A calm, judgment-free personal finance tracker — starts as a single-user bank-account ledger, grows toward credit cards and shared accounts.

> Working name — see [`docs/analise-inicial.md`](docs/analise-inicial.md) for why.

## Where things live

- [`CONTEXT.md`](CONTEXT.md) — domain glossary, the source of truth for terminology
- [`docs/adr/`](docs/adr/) — architecture decisions and why they were made
- [`docs/analise-inicial.md`](docs/analise-inicial.md) — the original spreadsheet analysis that started this project
- [`docs/stitch-prompt.md`](docs/stitch-prompt.md) — prompts for generating the UI layout in Google Stitch

## Stack

Next.js + TypeScript (PWA) · Neon (Postgres) · Auth.js · Vercel — see the ADRs for why.

## Local development

```bash
cp .env.example .env   # fill in the secrets
docker-compose up
```

This starts:

- `app` — the Next.js dev server, http://localhost:3000
- `db` — Postgres, mirroring the shape of the Neon production database
- `adminer` — DB inspector UI, http://localhost:8080 (system: PostgreSQL, server: `db`, user/password/database: `kontrola`)

Production uses Vercel + Neon directly ([ADR-0001](docs/adr/0001-neon-over-supabase.md)) — docker-compose is dev-only ([ADR-0006](docs/adr/0006-docker-compose-for-local-dev.md)).

> **Note:** `app` needs a Next.js project (`package.json`) to actually build, and this repo doesn't have the scaffold yet. `db`/`adminer` already work today; `app` becomes runnable once the scaffold lands.

## Known gaps (parked for later)

- **Dark mode / safe-area only cover 6 of 27 Stitch screens** — the design is unified and documented ([`docs/kontrola-calm-control-DESIGN.md`](docs/kontrola-calm-control-DESIGN.md)), just not yet applied everywhere. Full details and ready-to-paste Stitch prompts in [`docs/stitch-export/INDEX.md`](docs/stitch-export/INDEX.md). Safe-area itself will be implemented for real directly in the app's global CSS/layout regardless of Stitch coverage — see that doc.
