import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  numeric,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Scope: MVP + v1.1 (recurring) entities only, per docs/analise-inicial.md's
// roadmap. CreditCard (v2) and AccountMember (v3) are deliberately not
// modeled yet — same discipline we applied to the Stitch screens: build
// what's needed now, not what's coming later. See CONTEXT.md for the
// vocabulary these tables implement.

// A Postgres session variable set per-request (see src/db/index.ts's
// withUserContext) backs every policy below — this is ADR-0002's chosen
// isolation mechanism, since Neon doesn't have Supabase's auth.uid().
const currentUserId = sql`current_setting('app.user_id', true)::uuid`;

// IMPORTANT — Postgres exempts table owners from RLS unless FORCE is also
// set, and that isn't something drizzle-orm's .enableRLS() expresses. The
// generated migration (drizzle/0000_*.sql) has hand-added
// `ALTER TABLE ... FORCE ROW LEVEL SECURITY;` for every table below —
// if you ever regenerate that migration from scratch, re-add those lines,
// or every policy here silently becomes a no-op for the app's own role.

// Auth (login-by-email, sign-up) necessarily runs before any session
// exists, so there's no app.user_id yet to check against — a single
// blanket policy can't work here the way it does for every other table.
// Four narrow policies instead of one FOR ALL: anyone may look up a user
// by email (login) or create one (sign-up) — this table is only ever
// touched by our own server-side code, never exposed as a public listing
// API — but only the row's own owner may change or remove it afterward.
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name"),

    // Settings screen preferences (docs/stitch-export/14-settings.html).
    // Default currency is only used to pre-fill new Accounts — see
    // CONTEXT.md's Currency entry, it never converts anything.
    defaultCurrency: varchar("default_currency", { length: 3 })
      .notNull()
      .default("BRL"),
    locale: varchar("locale", { length: 5 }).notNull().default("en"), // matches src/i18n/request.ts locales
    theme: varchar("theme", { length: 6 }).notNull().default("system"), // 'light' | 'dark' | 'system'

    // Notification settings screen (docs/stitch-export/12-notification-settings.html)
    inactivityReminderDays: numeric("inactivity_reminder_days", {
      precision: 3,
      scale: 0,
    })
      .notNull()
      .default("3"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("users_select_for_login", {
      for: "select",
      using: sql`true`,
    }),
    pgPolicy("users_insert_for_signup", {
      for: "insert",
      withCheck: sql`true`,
    }),
    pgPolicy("users_update_self_only", {
      for: "update",
      using: sql`${table.id} = ${currentUserId}`,
      withCheck: sql`${table.id} = ${currentUserId}`,
    }),
    pgPolicy("users_delete_self_only", {
      for: "delete",
      using: sql`${table.id} = ${currentUserId}`,
    }),
  ],
).enableRLS();

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    nickname: text("nickname").notNull(), // e.g. "Main Checking"
    bankName: text("bank_name"), // e.g. "Itaú" — free text, not an enum, banks aren't modeled (CONTEXT.md)
    currency: varchar("currency", { length: 3 }).notNull(), // set once at creation, never changes (CONTEXT.md Currency)
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("accounts_owner_only", {
      for: "all",
      using: sql`${table.userId} = ${currentUserId}`,
      withCheck: sql`${table.userId} = ${currentUserId}`,
    }),
  ],
).enableRLS();

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Null = one of the system-default categories, visible to everyone.
    // Set = a custom category created by that User. (CONTEXT.md: "Comes
    // from a system-defined default set, or created by the User.")
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    icon: text("icon"), // Material Symbols icon name, matches the Stitch screens
    isSystemDefault: boolean("is_system_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("categories_own_or_system", {
      for: "all",
      using: sql`${table.userId} = ${currentUserId} OR ${table.userId} IS NULL`,
      withCheck: sql`${table.userId} = ${currentUserId}`, // can only ever create/edit your own, never system defaults
    }),
  ],
).enableRLS();

export const recurringTemplates = pgTable(
  "recurring_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    description: text("description").notNull(), // ciphertext — see src/lib/crypto.ts (ADR-0003)
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(), // always positive; direction carries the sign
    direction: varchar("direction", { length: 6 }).notNull(), // 'credit' | 'debit'
    // Fixed catalog, not a free interval — see ADR-0008.
    frequency: varchar("frequency", { length: 12 }).notNull(), // 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual'
    isEstimated: boolean("is_estimated").notNull().default(false), // ADR-0008: "~R$ 120 (Est.)" treatment
    nextOccurrenceOn: date("next_occurrence_on").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("recurring_templates_via_account_owner", {
      for: "all",
      using: sql`EXISTS (SELECT 1 FROM accounts WHERE accounts.id = ${table.accountId} AND accounts.user_id = ${currentUserId})`,
      withCheck: sql`EXISTS (SELECT 1 FROM accounts WHERE accounts.id = ${table.accountId} AND accounts.user_id = ${currentUserId})`,
    }),
  ],
).enableRLS();

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    recurringTemplateId: uuid("recurring_template_id").references(
      () => recurringTemplates.id,
      { onDelete: "set null" },
    ),
    description: text("description").notNull(), // ciphertext — see src/lib/crypto.ts (ADR-0003)
    note: text("note"), // ciphertext, optional — the "Note (Optional)" field on Confirm Recurring
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(), // always positive; direction carries the sign. Deliberately NOT encrypted (ADR-0003) so Balance/reports can SUM in SQL.
    direction: varchar("direction", { length: 6 }).notNull(), // 'credit' | 'debit' (CONTEXT.md Direction)
    // 'planned' | 'actual' — only 'actual' counts toward Balance (CONTEXT.md
    // Transaction / Balance, ADR-0004). Confirming a planned Transaction
    // flips this in place; it never becomes a new row.
    status: varchar("status", { length: 7 }).notNull().default("actual"),
    occurredOn: date("occurred_on").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    pgPolicy("transactions_via_account_owner", {
      for: "all",
      using: sql`EXISTS (SELECT 1 FROM accounts WHERE accounts.id = ${table.accountId} AND accounts.user_id = ${currentUserId})`,
      withCheck: sql`EXISTS (SELECT 1 FROM accounts WHERE accounts.id = ${table.accountId} AND accounts.user_id = ${currentUserId})`,
    }),
  ],
).enableRLS();
