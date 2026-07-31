CREATE TABLE "challenge_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenge_submissions" ADD COLUMN "duration_seconds" integer;--> statement-breakpoint
ALTER TABLE "challenge_comments" ADD CONSTRAINT "challenge_comments_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_comments" ADD CONSTRAINT "challenge_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "challenge_comments_challenge_id_idx" ON "challenge_comments" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "challenge_comments_user_id_idx" ON "challenge_comments" USING btree ("user_id");