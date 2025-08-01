ALTER TABLE "todos" ADD COLUMN "organization_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "todos" ADD CONSTRAINT "todos_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
