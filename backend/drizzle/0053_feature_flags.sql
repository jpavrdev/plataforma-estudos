CREATE TYPE "public"."feature_flag_status" AS ENUM('off', 'beta', 'on');--> statement-breakpoint
CREATE TABLE "feature_flag_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flag_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flag_users_flag_id_user_id_unique" UNIQUE("flag_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(80) NOT NULL,
	"description" varchar(200) NOT NULL,
	"status" "feature_flag_status" DEFAULT 'off' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "feature_flag_users" ADD CONSTRAINT "feature_flag_users_flag_id_feature_flags_id_fk" FOREIGN KEY ("flag_id") REFERENCES "public"."feature_flags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flag_users" ADD CONSTRAINT "feature_flag_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feature_flag_users_user_id_idx" ON "feature_flag_users" USING btree ("user_id");