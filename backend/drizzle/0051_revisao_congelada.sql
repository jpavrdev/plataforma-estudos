ALTER TABLE "simulado_attempt_questions" ALTER COLUMN "question_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "simulado_attempt_questions" ADD COLUMN "snapshot" jsonb;