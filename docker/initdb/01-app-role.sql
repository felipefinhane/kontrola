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
-- This mirrors Neon's own setup: the role Neon gives you isn't a true
-- superuser either, just the table owner, which FORCE ROW LEVEL SECURITY
-- already handles there. Locally we need this extra role only because of
-- the bootstrap-superuser quirk above.
CREATE ROLE kontrola_app LOGIN PASSWORD 'kontrola_app';
GRANT USAGE ON SCHEMA public TO kontrola_app;

-- Applies automatically to every table/sequence the bootstrap role creates
-- from now on (i.e. every Drizzle migration), so there's nothing to re-run
-- after `npm run db:migrate`.
ALTER DEFAULT PRIVILEGES FOR ROLE kontrola IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO kontrola_app;
ALTER DEFAULT PRIVILEGES FOR ROLE kontrola IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO kontrola_app;
