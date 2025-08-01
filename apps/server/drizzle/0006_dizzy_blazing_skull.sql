ALTER TABLE "session" ADD COLUMN "active_organization_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_active_organization_id_organization_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
