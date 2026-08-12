---
status: accepted
---

# Use plain `pg` (node-postgres) over TCP, not `@neondatabase/serverless`

The app connects to Postgres with the standard `pg` driver via `drizzle-orm/node-postgres`, using a normal `postgres://` connection string — not the `@neondatabase/serverless` HTTP/WebSocket driver that Neon promotes for edge/serverless environments.

Two reasons: first, `@neondatabase/serverless`'s HTTP driver has no real transaction support (`.transaction()` throws), and ADR-0002's RLS approach needs `SET LOCAL app.user_id` to hold for the lifetime of an actual transaction on one connection — the WebSocket driver can do this, but only against Neon's own proxy, not against a vanilla Postgres. Second, that's exactly what the local dev database is (ADR-0006: plain `postgres:16-alpine` in docker-compose) — the serverless driver can't talk to it at all without self-hosting Neon's separate `wsproxy`. Plain `pg` over TCP works identically against local docker Postgres and against Neon (which exposes a normal TCP endpoint too), with full transaction support and no proxy to run.

**Considered and rejected**: `@neondatabase/serverless`. It exists to reduce connection overhead in edge/serverless runtimes — a real benefit we're not positioned to use, since Auth.js and the field-encryption code (`src/lib/crypto.ts`, Node's `crypto` module) already require the Node.js runtime, not Edge. In production, use Neon's *pooled* (PgBouncer) connection string as `DATABASE_URL` to keep serverless function invocations from exhausting connections — same driver, just a different connection string.
