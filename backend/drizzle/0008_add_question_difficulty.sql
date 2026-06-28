CREATE TYPE "public"."question_difficulty" AS ENUM('facil', 'medio', 'dificil');--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "difficulty" "question_difficulty" DEFAULT 'facil' NOT NULL;