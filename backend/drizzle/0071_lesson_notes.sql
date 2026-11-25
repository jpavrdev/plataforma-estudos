CREATE TABLE "lesson_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"kind" varchar(10) NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_notes" ADD CONSTRAINT "lesson_notes_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lesson_notes_user_id_idx" ON "lesson_notes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lesson_notes_lesson_id_idx" ON "lesson_notes" USING btree ("lesson_id");