CREATE TABLE "certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(20) NOT NULL,
	"user_id" uuid NOT NULL,
	"trail_id" uuid NOT NULL,
	"student_name" varchar(255) NOT NULL,
	"cpf" varchar(11) NOT NULL,
	"trail_name" varchar(255) NOT NULL,
	"workload_hours" integer NOT NULL,
	"language" varchar(40),
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "certificates_code_unique" UNIQUE("code"),
	CONSTRAINT "certificates_user_id_trail_id_unique" UNIQUE("user_id","trail_id")
);
--> statement-breakpoint
ALTER TABLE "trails" ADD COLUMN "workload_hours" integer;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_trail_id_trails_id_fk" FOREIGN KEY ("trail_id") REFERENCES "public"."trails"("id") ON DELETE no action ON UPDATE no action;