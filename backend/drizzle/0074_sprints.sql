CREATE TYPE "public"."user_sprint_task_status" AS ENUM('backlog', 'doing', 'done');--> statement-breakpoint
CREATE TABLE "sprint_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sprint_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"track_name" varchar(40) NOT NULL,
	"title" varchar(160) NOT NULL,
	"description" text NOT NULL,
	"points" integer NOT NULL,
	"tag" varchar(40) NOT NULL,
	"starter_code" text NOT NULL,
	"criteria" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sprint_tasks_sprint_id_position_unique" UNIQUE("sprint_id","position")
);
--> statement-breakpoint
CREATE TABLE "sprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"product" varchar(120) NOT NULL,
	"summary" text NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"position" integer DEFAULT 1 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sprints_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_sprint_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"status" "user_sprint_task_status" NOT NULL,
	"code" text,
	"xp_earned" integer DEFAULT 0 NOT NULL,
	"done_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_sprint_tasks_user_id_task_id_unique" UNIQUE("user_id","task_id")
);
--> statement-breakpoint
ALTER TABLE "sprint_tasks" ADD CONSTRAINT "sprint_tasks_sprint_id_sprints_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."sprints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sprint_tasks" ADD CONSTRAINT "user_sprint_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sprint_tasks" ADD CONSTRAINT "user_sprint_tasks_task_id_sprint_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."sprint_tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sprint_tasks_sprint_id_idx" ON "sprint_tasks" USING btree ("sprint_id");--> statement-breakpoint
CREATE INDEX "user_sprint_tasks_user_id_idx" ON "user_sprint_tasks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_sprint_tasks_task_id_idx" ON "user_sprint_tasks" USING btree ("task_id");