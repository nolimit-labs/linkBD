CREATE TABLE IF NOT EXISTS "migration_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"migration_file" text NOT NULL,
	"status" text NOT NULL,
	"started_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"error" text,
	"run_by" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "migration_runs" ADD CONSTRAINT "migration_runs_run_by_user_id_fk" FOREIGN KEY ("run_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_posts_visibility_created_at" ON "posts" USING btree ("visibility","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_posts_user_visibility_created_at" ON "posts" USING btree ("user_id","visibility","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_posts_org_visibility_created_at" ON "posts" USING btree ("organization_id","visibility","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_posts_likes_count_created_at" ON "posts" USING btree ("likes_count" DESC NULLS LAST,"created_at" DESC NULLS LAST);