-- Runs once, when the `db` container's data volume is first created
-- (docker-entrypoint-initdb.d convention).
--
-- The bootstrap role (kontrola / $POSTGRES_USER) can never be demoted from
-- SUPERUSER -- Postgres refuses it ("The bootstrap user must have the
-- SUPERUSER attribute"). Superusers bypass RLS unconditionally, even with
-- FORCE ROW LEVEL SECURITY (ADR-0002), so testing authorization locally
-- needs a second, genuinely-restricted role for the app to actually
-- connect as. Migrations still run as the bootstrap role (DATABASE_ADMIN_URL);
-- the app's own queries run as this one (DATABASE_URL) -- see .env.example.
--
-- ADR-0011: this ALSO has to exist in Neon, not just locally -- Neon's
-- own default role has BYPASSRLS (a separate grant from SUPERUSER), so it
-- bypasses RLS too despite FORCE ROW LEVEL SECURITY. An earlier revision
-- of this comment assumed Neon's role was safe to use directly; it isn't.
-- The production kontrola_app role is created by hand against Neon
-- (no init-script equivalent there) -- see ADR-0011 for the exact grants,
-- which mirror this file.
CREATE ROLE kontrola_app LOGIN PASSWORD 'kontrola_app';
GRANT USAGE ON SCHEMA public TO kontrola_app;

-- Applies automatically to every table/sequence the bootstrap role creates
-- from now on (i.e. every Drizzle migration), so there's nothing to re-run
-- after `npm run db:migrate`.
ALTER DEFAULT PRIVILEGES FOR ROLE kontrola IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO kontrola_app;
ALTER DEFAULT PRIVILEGES FOR ROLE kontrola IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO kontrola_app;
