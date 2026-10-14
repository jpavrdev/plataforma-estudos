-- Modo de prática no simulado: a tentativa marca o modo, e cada questão guarda
-- quando o aluno conferiu o gabarito. Conferida trava a resposta daquela questão.
ALTER TABLE "simulado_attempt_questions" ADD COLUMN "revealed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "simulado_attempts" ADD COLUMN "pratica" boolean DEFAULT false NOT NULL;
