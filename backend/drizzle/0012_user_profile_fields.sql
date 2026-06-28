ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "location" varchar(120);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "occupation" varchar(120);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "languages" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "github" varchar(200);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "linkedin" varchar(200);