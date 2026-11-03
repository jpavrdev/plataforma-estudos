ALTER TABLE "users" ADD COLUMN "phone_verified_at" timestamp with time zone;--> statement-breakpoint
-- Telefone já cadastrado em conta com email verificado conta como verificado: quase
-- sempre foi o próprio aluno quem cadastrou, e a recuperação por WhatsApp segue valendo.
UPDATE "users" SET "phone_verified_at" = now() WHERE "phone" IS NOT NULL AND "email_verified_at" IS NOT NULL;
