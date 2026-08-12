import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, isNull } from "drizzle-orm";
import * as schema from "./schema";

// System-default categories (CONTEXT.md Category: "Comes from a
// system-defined default set, or created by the User"). user_id stays
// NULL — see schema.ts's categories_own_or_system policy. Needs the admin
// connection: even the app's own restricted role can't insert a NULL-owner
// row, by design (docs/stitch-export/10-categories.html for the icon set).
const DEFAULT_CATEGORIES = [
  { name: "Housing", icon: "home" },
  { name: "Food", icon: "restaurant" },
  { name: "Transport", icon: "directions_car" },
  { name: "Health", icon: "favorite" },
  { name: "Education", icon: "school" },
  { name: "Subscriptions", icon: "subscriptions" },
  { name: "Income", icon: "payments" },
  { name: "Transfer", icon: "swap_horiz" },
  { name: "Other", icon: "category" },
];

async function main() {
  const connectionString =
    process.env.DATABASE_ADMIN_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Neither DATABASE_ADMIN_URL nor DATABASE_URL is set — see .env.example",
    );
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  // No unique constraint on (name) to key an onConflictDoNothing() off of
  // — a system category's name isn't unique by schema, just by convention
  // — so idempotency is a plain existence check instead, keeping this
  // script safe to re-run.
  let inserted = 0;
  for (const category of DEFAULT_CATEGORIES) {
    const [existing] = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(
        and(
          eq(schema.categories.name, category.name),
          isNull(schema.categories.userId),
        ),
      )
      .limit(1);

    if (!existing) {
      await db
        .insert(schema.categories)
        .values({ ...category, isSystemDefault: true });
      inserted++;
    }
  }

  console.log(
    `Seeded ${inserted} new default categories (${DEFAULT_CATEGORIES.length - inserted} already existed).`,
  );
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
