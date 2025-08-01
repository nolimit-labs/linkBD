CREATE TABLE IF NOT EXISTS "subscription_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"todos_limit" integer NOT NULL,
	"files_limit" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_plans_name_unique" UNIQUE("name")
);
