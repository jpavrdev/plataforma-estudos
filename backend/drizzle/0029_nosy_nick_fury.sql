CREATE TYPE "public"."roadmap_phase" AS ENUM('fundamentos', 'core', 'avancado', 'deploy');--> statement-breakpoint
CREATE TYPE "public"."roadmap_ref_type" AS ENUM('trail', 'module', 'lesson', 'simulado', 'challenge');--> statement-breakpoint
CREATE TABLE "roadmap_stage_refs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stage_id" uuid NOT NULL,
	"ref_type" "roadmap_ref_type" NOT NULL,
	"ref_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roadmap_id" uuid NOT NULL,
	"phase" "roadmap_phase" NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"tags" jsonb,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text NOT NULL,
	"level" "trail_level" NOT NULL,
	"icon" varchar(40),
	"position" integer DEFAULT 0 NOT NULL,
	"premium" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roadmaps_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "roadmap_stage_refs" ADD CONSTRAINT "roadmap_stage_refs_stage_id_roadmap_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."roadmap_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_stages" ADD CONSTRAINT "roadmap_stages_roadmap_id_roadmaps_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."roadmaps"("id") ON DELETE no action ON UPDATE no action;