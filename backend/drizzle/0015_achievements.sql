CREATE TYPE "public"."achievement_criteria" AS ENUM('xp_total', 'lessons_completed', 'questions_correct');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" varchar(200) NOT NULL,
	"icon" varchar(30) NOT NULL,
	"criteria_type" "achievement_criteria" NOT NULL,
	"threshold" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_achievements_user_id_achievement_id_unique" UNIQUE("user_id","achievement_id")
);
--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
INSERT INTO "achievements" ("name","description","icon","criteria_type","threshold") VALUES
('Primeiros passos','Conclua sua primeira aula','trophy','lessons_completed',1),
('Ritmo de estudo','Conclua 5 aulas','flame','lessons_completed',5),
('Maratonista','Conclua 10 aulas','medal','lessons_completed',10),
('Pontaria','Acerte 25 questões','check','questions_correct',25),
('Centurião','Acerte 100 questões','check','questions_correct',100),
('Em ascensão','Alcance 500 XP','star','xp_total',500),
('Veterano','Alcance 2000 XP','star','xp_total',2000)
ON CONFLICT ("name") DO NOTHING;