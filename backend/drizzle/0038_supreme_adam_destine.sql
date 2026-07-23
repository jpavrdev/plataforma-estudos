CREATE TYPE "public"."subscription_plan" AS ENUM('mensal', 'anual', 'pix_auto');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('pendente', 'ativa', 'cancelada');--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" "subscription_plan" NOT NULL,
	"status" "subscription_status" DEFAULT 'pendente' NOT NULL,
	"amount_cents" integer NOT NULL,
	"gateway" varchar(20) DEFAULT 'abacatepay' NOT NULL,
	"gateway_id" varchar(120),
	"paid_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "accent" varchar(7);--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;