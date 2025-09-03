-- Create followers table for both user and organization follows
CREATE TABLE IF NOT EXISTS "followers" (
	"id" text PRIMARY KEY NOT NULL,
	"follower_id" text NOT NULL,
	"following_id" text, -- User being followed
	"following_org_id" text, -- Organization being followed
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "followers_follower_id_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "followers_following_id_user_id_fk" FOREIGN KEY ("following_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "followers_following_org_id_organization_id_fk" FOREIGN KEY ("following_org_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action
);

-- Create indexes for followers table
CREATE UNIQUE INDEX IF NOT EXISTS "idx_unique_user_follow" ON "followers" ("follower_id","following_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_unique_org_follow" ON "followers" ("follower_id","following_org_id");
CREATE INDEX IF NOT EXISTS "idx_followers_follower" ON "followers" ("follower_id");
CREATE INDEX IF NOT EXISTS "idx_followers_following" ON "followers" ("following_id");
CREATE INDEX IF NOT EXISTS "idx_followers_following_org" ON "followers" ("following_org_id");
CREATE INDEX IF NOT EXISTS "idx_followers_created_at" ON "followers" ("created_at" DESC);