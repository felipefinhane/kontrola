import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — see .env.example");
}

// Plain `pg` over a normal TCP connection string — not the
// @neondatabase/serverless WebSocket driver. That driver only talks to
// Neon's own WebSocket proxy, not to a vanilla Postgres like the local
// docker-compose `db` service (ADR-0006), and RLS's SET LOCAL app.user_id
// (ADR-0002) needs a real transaction on one connection either way. Neon
// exposes a normal postgres:// connection string too — in production, use
// its *pooled* (PgBouncer) variant to avoid exhausting connections from
// serverless invocations.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Connects as the restricted kontrola_app role (DATABASE_URL) — RLS is
 * always in effect on this connection, by design (ADR-0002/0009): there is
 * no "admin" pool anywhere in app code to accidentally reach for instead.
 * Auth (login/sign-up) queries in src/auth.ts use this directly, without
 * withUserContext — schema.ts's users_select_for_login/users_insert_for_signup
 * policies allow that on their own, since there's no session yet to scope
 * by. Every other table requires withUserContext below, or its policy
 * returns zero rows.
 */
export const db = drizzle(pool, { schema });

/**
 * ADR-0002: sets the `app.user_id` session variable the RLS policies in
 * schema.ts check, scoped to a single transaction via SET LOCAL. This is
 * the one place in the app allowed to assert "run these queries as this
 * user" — every repository/query function should go through this rather
 * than filtering by user_id itself, so isolation is enforced by Postgres,
 * not by every call site remembering to add a WHERE clause.
 */
export async function withUserContext<T>(
  userId: string,
  run: (tx: typeof db) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_id', ${userId}, true)`);
    return run(tx as unknown as typeof db);
  });
}
