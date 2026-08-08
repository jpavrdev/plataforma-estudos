CREATE TYPE "public"."card_origem" AS ENUM('flashcard', 'glossario');--> statement-breakpoint
CREATE TYPE "public"."card_resposta" AS ENUM('errei', 'dificil', 'intermediaria', 'facil');--> statement-breakpoint
CREATE TABLE "card_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"origem" "card_origem" NOT NULL,
	"origem_id" uuid NOT NULL,
	"resposta" "card_resposta" NOT NULL,
	"retencao_prevista" numeric(4, 3),
	"estabilidade_antes" numeric(8, 2) NOT NULL,
	"estabilidade_depois" numeric(8, 2) NOT NULL,
	"intervalo_dias" integer NOT NULL,
	"tempo_ms" integer,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flashcards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"frente" text NOT NULL,
	"verso" varchar(200) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"origem" "card_origem" NOT NULL,
	"origem_id" uuid NOT NULL,
	"estabilidade" numeric(8, 2) DEFAULT '0' NOT NULL,
	"intervalo_dias" integer DEFAULT 0 NOT NULL,
	"facilidade" numeric(4, 2) DEFAULT '2.50' NOT NULL,
	"repeticoes" integer DEFAULT 0 NOT NULL,
	"lapsos" integer DEFAULT 0 NOT NULL,
	"proxima_revisao" timestamp with time zone DEFAULT now() NOT NULL,
	"ultima_revisao" timestamp with time zone,
	CONSTRAINT "user_cards_user_id_origem_origem_id_unique" UNIQUE("user_id","origem","origem_id")
);
--> statement-breakpoint
ALTER TABLE "card_reviews" ADD CONSTRAINT "card_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_cards" ADD CONSTRAINT "user_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "card_reviews_user_idx" ON "card_reviews" USING btree ("user_id","criado_em");--> statement-breakpoint
CREATE INDEX "flashcards_lesson_id_idx" ON "flashcards" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "user_cards_fila_idx" ON "user_cards" USING btree ("user_id","proxima_revisao");