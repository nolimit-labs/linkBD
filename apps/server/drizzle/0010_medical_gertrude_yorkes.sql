ALTER TABLE "followers" RENAME COLUMN "follower_id" TO "follower_user_id";--> statement-breakpoint
ALTER TABLE "followers" DROP CONSTRAINT "followers_follower_id_user_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_unique_user_follow";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_unique_org_follow";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_followers_follower";--> statement-breakpoint
ALTER TABLE "followers" ALTER COLUMN "follower_user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "followers" ADD COLUMN "follower_org_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_user_id_user_id_fk" FOREIGN KEY ("follower_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_org_id_organization_id_fk" FOREIGN KEY ("follower_org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_unique_user_user_follow" ON "followers" USING btree ("follower_user_id","following_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_unique_user_org_follow" ON "followers" USING btree ("follower_user_id","following_org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_unique_org_user_follow" ON "followers" USING btree ("follower_org_id","following_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_unique_org_org_follow" ON "followers" USING btree ("follower_org_id","following_org_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_followers_follower_user" ON "followers" USING btree ("follower_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_followers_follower_org" ON "followers" USING btree ("follower_org_id");