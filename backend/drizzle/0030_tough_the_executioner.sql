ALTER TABLE "lessons" ADD COLUMN "duration_min" integer;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "preview" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "trails" ADD COLUMN "what_you_learn" jsonb;--> statement-breakpoint
ALTER TABLE "trails" ADD COLUMN "prerequisites" jsonb;