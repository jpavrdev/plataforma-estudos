CREATE TYPE "public"."comunicado_kind" AS ENUM('aviso', 'pesquisa');--> statement-breakpoint
CREATE TYPE "public"."comunicado_resposta_status" AS ENUM('respondido', 'dispensado');--> statement-breakpoint
CREATE TABLE "comunicado_respostas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comunicado_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "comunicado_resposta_status" NOT NULL,
	"rating" integer,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comunicado_respostas_comunicado_id_user_id_unique" UNIQUE("comunicado_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "comunicados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "comunicado_kind" NOT NULL,
	"title" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comunicado_respostas" ADD CONSTRAINT "comunicado_respostas_comunicado_id_comunicados_id_fk" FOREIGN KEY ("comunicado_id") REFERENCES "public"."comunicados"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comunicado_respostas" ADD CONSTRAINT "comunicado_respostas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;