---
status: accepted
---

# docker-compose for local development only — production stays Vercel + Neon

Local development runs via `docker-compose up`: a Postgres container (`db`) mirroring the shape of the Neon database, Adminer for inspecting it, and the Next.js app itself in a dev container with hot reload. One command, fully offline, never touches production data.

This does not change [ADR-0001](./0001-neon-over-supabase.md) — production is still Vercel (app) + Neon (Postgres). Docker-compose is a dev tool, not a deployment target.

**Considered and rejected**: a Neon branch (Neon supports free, instant DB branching) as the dev database instead of a local container. Rejected for now because it still needs network access and a Neon account before you can start, where `docker-compose up` works with zero cloud setup — closer to "clone and run". Worth revisiting once the schema stabilizes and branch-per-feature becomes more useful than day-to-day local dev.
