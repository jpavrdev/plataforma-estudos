CREATE TYPE "public"."challenge_kind" AS ENUM('stdin', 'function');--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "kind" "challenge_kind" DEFAULT 'stdin' NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "entry_point" varchar(120);