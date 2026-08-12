import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Migrations need to CREATE TABLEs/ROLEs — the restricted kontrola_app
// role (docker/initdb/01-app-role.sql, ADR-0009) can't do that, so this
// prefers DATABASE_ADMIN_URL (set in docker-compose.yml) and only falls
// back to DATABASE_URL for environments with just one role (e.g. Neon,
// where FORCE ROW LEVEL SECURITY already closes the owner-bypass gap —
// see ADR-0002).
const connectionString =
  process.env.DATABASE_ADMIN_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Neither DATABASE_ADMIN_URL nor DATABASE_URL is set — see .env.example",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
