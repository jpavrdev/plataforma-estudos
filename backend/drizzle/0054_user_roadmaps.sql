CREATE TABLE "user_roadmaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"roadmap_id" uuid NOT NULL,
	"explicito" boolean DEFAULT false NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roadmaps_user_id_roadmap_id_unique" UNIQUE("user_id","roadmap_id")
);
--> statement-breakpoint
ALTER TABLE "user_roadmaps" ADD CONSTRAINT "user_roadmaps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roadmaps" ADD CONSTRAINT "user_roadmaps_roadmap_id_roadmaps_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."roadmaps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_roadmaps_user_id_idx" ON "user_roadmaps" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_roadmaps_roadmap_id_idx" ON "user_roadmaps" USING btree ("roadmap_id");