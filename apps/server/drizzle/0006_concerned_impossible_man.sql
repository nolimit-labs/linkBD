ALTER TABLE "organization" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "featured_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_organizations_featured_at" ON "organization" USING btree ("is_featured","featured_at" DESC NULLS LAST);