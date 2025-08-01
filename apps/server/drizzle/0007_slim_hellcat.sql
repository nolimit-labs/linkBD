CREATE TABLE IF NOT EXISTS "storage" (
	"id" text PRIMARY KEY NOT NULL,
	"file_key" text NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "storage_file_key_unique" UNIQUE("file_key")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "storage" ADD CONSTRAINT "storage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "storage" ADD CONSTRAINT "storage_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_storage_user_id" ON "storage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_storage_organization_id" ON "storage" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_storage_created_at" ON "storage" USING btree ("created_at");