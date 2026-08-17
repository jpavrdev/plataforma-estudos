ALTER TABLE "question_answers" ADD COLUMN "acertou_em" timestamp with time zone;--> statement-breakpoint
-- Backfill: quem já tinha a resposta marcada como certa acertou naquele momento.
-- Como o registro antigo guardava a PRIMEIRA tentativa, a data dele é justamente a
-- do primeiro acerto. Isso mantém o XP diário e o ranking idênticos ao que já era
-- exibido, porque linha errada continua sem acerto e linha certa mantém a data.
UPDATE "question_answers" SET "acertou_em" = "answered_at" WHERE "is_correct" = true;
