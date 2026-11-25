CREATE TABLE "lesson_translations" (
	"lesson_id" uuid NOT NULL,
	"locale" varchar(5) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text,
	"content_blocks" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_translations_lesson_id_locale_pk" PRIMARY KEY("lesson_id","locale")
);
--> statement-breakpoint
CREATE TABLE "module_translations" (
	"module_id" uuid NOT NULL,
	"locale" varchar(5) NOT NULL,
	"title" varchar(255) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "module_translations_module_id_locale_pk" PRIMARY KEY("module_id","locale")
);
--> statement-breakpoint
CREATE TABLE "option_translations" (
	"option_id" uuid NOT NULL,
	"locale" varchar(5) NOT NULL,
	"text" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "option_translations_option_id_locale_pk" PRIMARY KEY("option_id","locale")
);
--> statement-breakpoint
CREATE TABLE "question_translations" (
	"question_id" uuid NOT NULL,
	"locale" varchar(5) NOT NULL,
	"statement" text NOT NULL,
	"explanation" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_translations_question_id_locale_pk" PRIMARY KEY("question_id","locale")
);
--> statement-breakpoint
CREATE TABLE "trail_translations" (
	"trail_id" uuid NOT NULL,
	"locale" varchar(5) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"what_you_learn" jsonb,
	"prerequisites" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trail_translations_trail_id_locale_pk" PRIMARY KEY("trail_id","locale")
);
--> statement-breakpoint
ALTER TABLE "lesson_translations" ADD CONSTRAINT "lesson_translations_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_translations" ADD CONSTRAINT "module_translations_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_translations" ADD CONSTRAINT "option_translations_option_id_question_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."question_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_translations" ADD CONSTRAINT "question_translations_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trail_translations" ADD CONSTRAINT "trail_translations_trail_id_trails_id_fk" FOREIGN KEY ("trail_id") REFERENCES "public"."trails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lesson_translations_lesson_id_idx" ON "lesson_translations" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "module_translations_module_id_idx" ON "module_translations" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "option_translations_option_id_idx" ON "option_translations" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "question_translations_question_id_idx" ON "question_translations" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "trail_translations_trail_id_idx" ON "trail_translations" USING btree ("trail_id");