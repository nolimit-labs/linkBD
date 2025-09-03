CREATE TABLE IF NOT EXISTS "followers" (
	"id" text PRIMARY KEY NOT NULL,
	"follower_id" text NOT NULL,
	"following_id" text,
	"following_org_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followers" ADD CONSTRAINT "followers_following_id_user_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followers" ADD CONSTRAINT "followers_following_org_id_organization_id_fk" FOREIGN KEY ("following_org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_unique_user_follow" ON "followers" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_unique_org_follow" ON "followers" USING btree ("follower_id","following_org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_followers_follower" ON "followers" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_followers_following" ON "followers" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_followers_following_org" ON "followers" USING btree ("following_org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_followers_created_at" ON "followers" USING btree ("created_at" DESC NULLS LAST);