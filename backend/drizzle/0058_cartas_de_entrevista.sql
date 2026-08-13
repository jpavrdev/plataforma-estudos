CREATE TYPE "public"."interview_level" AS ENUM('estagio', 'junior', 'pleno', 'senior');--> statement-breakpoint
ALTER TYPE "public"."card_origem" ADD VALUE 'entrevista';--> statement-breakpoint
CREATE TABLE "interview_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topico_id" uuid NOT NULL,
	"nivel" "interview_level" NOT NULL,
	"frente" text NOT NULL,
	"verso" varchar(400) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(60) NOT NULL,
	"nome" varchar(80) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "interview_topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "interview_cards" ADD CONSTRAINT "interview_cards_topico_id_interview_topics_id_fk" FOREIGN KEY ("topico_id") REFERENCES "public"."interview_topics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "interview_cards_topico_id_idx" ON "interview_cards" USING btree ("topico_id");--> statement-breakpoint
CREATE INDEX "interview_cards_nivel_idx" ON "interview_cards" USING btree ("nivel");