ALTER TYPE "public"."achievement_criteria" ADD VALUE 'trail_completed';--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "ref_id" uuid;