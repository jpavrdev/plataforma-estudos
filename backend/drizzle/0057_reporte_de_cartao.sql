CREATE TABLE "card_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"origem" "card_origem" NOT NULL,
	"origem_id" uuid NOT NULL,
	"comentario" varchar(300),
	"resolvido_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "card_reports_user_id_origem_origem_id_unique" UNIQUE("user_id","origem","origem_id")
);
--> statement-breakpoint
ALTER TABLE "card_reports" ADD CONSTRAINT "card_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "card_reports_aberto_idx" ON "card_reports" USING btree ("resolvido_em","criado_em");