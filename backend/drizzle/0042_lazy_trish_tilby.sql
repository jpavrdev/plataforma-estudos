ALTER TYPE "public"."achievement_criteria" ADD VALUE 'streak_days';--> statement-breakpoint
ALTER TYPE "public"."achievement_criteria" ADD VALUE 'challenges_facil';--> statement-breakpoint
ALTER TYPE "public"."achievement_criteria" ADD VALUE 'challenges_medio';--> statement-breakpoint
ALTER TYPE "public"."achievement_criteria" ADD VALUE 'challenges_dificil';--> statement-breakpoint
ALTER TABLE "user_achievements" ADD COLUMN "notified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
-- Conquistas já desbloqueadas antes desta feature não devem disparar notificação retroativa.
UPDATE "user_achievements" SET "notified" = true;