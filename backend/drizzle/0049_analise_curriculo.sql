CREATE TYPE "public"."resume_analysis_engine" AS ENUM('heuristica', 'ia');--> statement-breakpoint
CREATE TABLE "resume_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"job_title" varchar(160),
	"score" integer NOT NULL,
	"verdict" varchar(80) NOT NULL,
	"description" text NOT NULL,
	"engine" "resume_analysis_engine" NOT NULL,
	"summary" jsonb NOT NULL,
	"breakdown" jsonb NOT NULL,
	"keywords_found" jsonb NOT NULL,
	"keywords_partial" jsonb NOT NULL,
	"keywords_missing" jsonb NOT NULL,
	"suggestions" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resume_analyses" ADD CONSTRAINT "resume_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "resume_analyses_user_id_idx" ON "resume_analyses" USING btree ("user_id");