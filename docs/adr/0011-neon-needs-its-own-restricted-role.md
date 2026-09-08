---
status: accepted
---

# Neon needs a genuinely-restricted app role too, not just local dev

ADR-0009 and the original `docker/initdb/01-app-role.sql` comment both assumed a single Neon role was safe for the app to run as directly, because "Neon's role isn't a true superuser, just the table owner, which FORCE ROW LEVEL SECURITY already handles." That assumption is wrong, and it meant production had **zero database-level tenant isolation** — RLS was configured correctly (policies, `FORCE ROW LEVEL SECURITY`, everything), and none of it was doing anything, discovered while building #8 Categories (see `docs/TASKS.md`) when a query returned another test user's transactions despite `app.user_id` being set correctly.

Postgres has two separate role attributes that both bypass RLS: `SUPERUSER`, and `BYPASSRLS` — an independent grant a role can hold without being a superuser. `FORCE ROW LEVEL SECURITY` only closes the *table-owner* bypass; it does nothing against a role with `BYPASSRLS`. Neon's default database-owner role (`neondb_owner` in this project) has `BYPASSRLS = true`. Confirmed directly:

```sql
select rolname, rolsuper, rolbypassrls from pg_roles where rolname = current_user;
--    rolname    | rolsuper | rolbypassrls
-- neondb_owner  | f        | t
```

With that role as `DATABASE_URL`, every RLS policy in `schema.ts` was a no-op for every request the deployed app ever served: isolation depended entirely on every query function remembering to go through `withUserContext` — exactly the single point of failure ADR-0002 says RLS exists to not depend on.

**Fix**: create a second role in the Neon database, `kontrola_app`, granted the same way as the local `docker/initdb/01-app-role.sql` role (`GRANT SELECT, INSERT, UPDATE, DELETE` on existing + default-privileges for future tables, no superuser/bypassrls/createrole attributes). `DATABASE_URL` in Vercel now points at `kontrola_app`; the former single `DATABASE_URL` value (the `neondb_owner` connection string) became `DATABASE_ADMIN_URL`, used only for migrations — mirroring local dev exactly, rather than Neon being a one-role special case.

Verified after the fix: a query with `app.user_id` set to a UUID that owns nothing returns zero rows against every table; the app itself (sign up, log in, create Account, create Category) still works end to end against the new restricted role, confirming the grants are sufficient.

**Takeaway for future ADRs**: "the table owner isn't a superuser" is not the same claim as "the table owner can't bypass RLS." Any managed Postgres provider's default role needs its `rolbypassrls` checked explicitly (`select rolbypassrls from pg_roles where rolname = current_user`) before being trusted as the app's runtime role — don't assume from the absence of `SUPERUSER` alone.
