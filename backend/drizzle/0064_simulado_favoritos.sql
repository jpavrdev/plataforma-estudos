CREATE TABLE "simulado_favoritos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"simulado_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "simulado_favoritos_simulado_id_user_id_unique" UNIQUE("simulado_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "simulado_favoritos" ADD CONSTRAINT "simulado_favoritos_simulado_id_simulados_id_fk" FOREIGN KEY ("simulado_id") REFERENCES "public"."simulados"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulado_favoritos" ADD CONSTRAINT "simulado_favoritos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "simulado_favoritos_user_id_idx" ON "simulado_favoritos" USING btree ("user_id");