CREATE TABLE "simulado_attempt_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"option_id" uuid NOT NULL,
	CONSTRAINT "simulado_attempt_answers_attempt_id_question_id_option_id_unique" UNIQUE("attempt_id","question_id","option_id")
);
--> statement-breakpoint
CREATE TABLE "simulado_attempt_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "simulado_attempt_questions_attempt_id_question_id_unique" UNIQUE("attempt_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "simulado_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"simulado_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone,
	"score" integer,
	"passed" boolean
);
--> statement-breakpoint
CREATE TABLE "simulado_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "simulado_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"simulado_id" uuid NOT NULL,
	"statement" text NOT NULL,
	"explanation" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "simulados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text,
	"duration_minutes" integer NOT NULL,
	"question_count" integer NOT NULL,
	"pass_percent" integer NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "simulados_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "simulado_attempt_answers" ADD CONSTRAINT "simulado_attempt_answers_attempt_id_simulado_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."simulado_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulado_attempt_answers" ADD CONSTRAINT "simulado_attempt_answers_question_id_simulado_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."simulado_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulado_attempt_answers" ADD CONSTRAINT "simulado_attempt_answers_option_id_simulado_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."simulado_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulado_attempt_questions" ADD CONSTRAINT "simulado_attempt_questions_attempt_id_simulado_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."simulado_attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulado_attempt_questions" ADD CONSTRAINT "simulado_attempt_questions_question_id_simulado_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."simulado_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulado_attempts" ADD CONSTRAINT "simulado_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulado_attempts" ADD CONSTRAINT "simulado_attempts_simulado_id_simulados_id_fk" FOREIGN KEY ("simulado_id") REFERENCES "public"."simulados"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulado_options" ADD CONSTRAINT "simulado_options_question_id_simulado_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."simulado_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simulado_questions" ADD CONSTRAINT "simulado_questions_simulado_id_simulados_id_fk" FOREIGN KEY ("simulado_id") REFERENCES "public"."simulados"("id") ON DELETE no action ON UPDATE no action;