CREATE TABLE "roadmap_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roadmap_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roadmap_favorites_roadmap_id_user_id_unique" UNIQUE("roadmap_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "roadmap_favorites" ADD CONSTRAINT "roadmap_favorites_roadmap_id_roadmaps_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."roadmaps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_favorites" ADD CONSTRAINT "roadmap_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "roadmap_favorites_user_id_idx" ON "roadmap_favorites" USING btree ("user_id");