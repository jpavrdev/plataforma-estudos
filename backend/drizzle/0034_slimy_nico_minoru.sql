CREATE TABLE "roadmap_stage_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roadmap_stage_completions_user_id_stage_id_unique" UNIQUE("user_id","stage_id")
);
--> statement-breakpoint
ALTER TABLE "roadmap_stage_completions" ADD CONSTRAINT "roadmap_stage_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_stage_completions" ADD CONSTRAINT "roadmap_stage_completions_stage_id_roadmap_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."roadmap_stages"("id") ON DELETE no action ON UPDATE no action;