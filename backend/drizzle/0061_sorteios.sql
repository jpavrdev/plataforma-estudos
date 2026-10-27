CREATE TABLE "sorteio_participacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sorteio_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"contatos" jsonb,
	"posicao" smallint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sorteio_participacoes_sorteio_id_user_id_unique" UNIQUE("sorteio_id","user_id"),
	CONSTRAINT "sorteio_participacoes_sorteio_id_posicao_unique" UNIQUE("sorteio_id","posicao")
);
--> statement-breakpoint
CREATE TABLE "sorteios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" varchar(120) NOT NULL,
	"descricao" text NOT NULL,
	"inicio" timestamp with time zone NOT NULL,
	"fim" timestamp with time zone NOT NULL,
	"sorteado_em" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sorteio_participacoes" ADD CONSTRAINT "sorteio_participacoes_sorteio_id_sorteios_id_fk" FOREIGN KEY ("sorteio_id") REFERENCES "public"."sorteios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sorteio_participacoes" ADD CONSTRAINT "sorteio_participacoes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sorteio_participacoes_user_id_idx" ON "sorteio_participacoes" USING btree ("user_id");