CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nickname" text NOT NULL,
	"bank_name" text,
	"currency" varchar(3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" text NOT NULL,
	"icon" text,
	"is_system_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "recurring_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"category_id" uuid,
	"description" text NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"direction" varchar(6) NOT NULL,
	"frequency" varchar(12) NOT NULL,
	"is_estimated" boolean DEFAULT false NOT NULL,
	"next_occurrence_on" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recurring_templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"category_id" uuid,
	"recurring_template_id" uuid,
	"description" text NOT NULL,
	"note" text,
	"amount" numeric(14, 2) NOT NULL,
	"direction" varchar(6) NOT NULL,
	"status" varchar(7) DEFAULT 'actual' NOT NULL,
	"occurred_on" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text,
	"default_currency" varchar(3) DEFAULT 'BRL' NOT NULL,
	"locale" varchar(5) DEFAULT 'en' NOT NULL,
	"theme" varchar(6) DEFAULT 'system' NOT NULL,
	"inactivity_reminder_days" numeric(3, 0) DEFAULT '3' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_templates" ADD CONSTRAINT "recurring_templates_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_templates" ADD CONSTRAINT "recurring_templates_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurring_template_id_recurring_templates_id_fk" FOREIGN KEY ("recurring_template_id") REFERENCES "public"."recurring_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "accounts_owner_only" ON "accounts" AS PERMISSIVE FOR ALL TO public USING ("accounts"."user_id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("accounts"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "categories_own_or_system" ON "categories" AS PERMISSIVE FOR ALL TO public USING ("categories"."user_id" = current_setting('app.user_id', true)::uuid OR "categories"."user_id" IS NULL) WITH CHECK ("categories"."user_id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "recurring_templates_via_account_owner" ON "recurring_templates" AS PERMISSIVE FOR ALL TO public USING (EXISTS (SELECT 1 FROM accounts WHERE accounts.id = "recurring_templates"."account_id" AND accounts.user_id = current_setting('app.user_id', true)::uuid)) WITH CHECK (EXISTS (SELECT 1 FROM accounts WHERE accounts.id = "recurring_templates"."account_id" AND accounts.user_id = current_setting('app.user_id', true)::uuid));--> statement-breakpoint
CREATE POLICY "transactions_via_account_owner" ON "transactions" AS PERMISSIVE FOR ALL TO public USING (EXISTS (SELECT 1 FROM accounts WHERE accounts.id = "transactions"."account_id" AND accounts.user_id = current_setting('app.user_id', true)::uuid)) WITH CHECK (EXISTS (SELECT 1 FROM accounts WHERE accounts.id = "transactions"."account_id" AND accounts.user_id = current_setting('app.user_id', true)::uuid));--> statement-breakpoint
CREATE POLICY "users_select_for_login" ON "users" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "users_insert_for_signup" ON "users" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "users_update_self_only" ON "users" AS PERMISSIVE FOR UPDATE TO public USING ("users"."id" = current_setting('app.user_id', true)::uuid) WITH CHECK ("users"."id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
CREATE POLICY "users_delete_self_only" ON "users" AS PERMISSIVE FOR DELETE TO public USING ("users"."id" = current_setting('app.user_id', true)::uuid);--> statement-breakpoint
-- RLS policies alone do NOT restrict the table owner (the role that ran
-- these migrations) — Postgres exempts owners/superusers from RLS unless
-- FORCE is set too. Without this, ADR-0002's isolation is silently a
-- no-op whenever the app connects as the same role that owns the tables.
ALTER TABLE "accounts" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "categories" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "recurring_templates" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "transactions" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
