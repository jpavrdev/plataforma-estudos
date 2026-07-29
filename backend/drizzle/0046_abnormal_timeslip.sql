ALTER TABLE "simulado_attempts" ALTER COLUMN "expires_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "simulado_attempts" ADD COLUMN "personalizado" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "simulado_attempts" ADD COLUMN "topicos" jsonb;