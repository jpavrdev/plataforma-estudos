CREATE TABLE "two_factor_auth" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"secret" text,
	"pending_secret" text,
	"enabled_at" timestamp with time zone,
	"last_step" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor_recovery_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code_hash" varchar(64) NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "two_factor_recovery_codes_code_hash_unique" UNIQUE("code_hash")
);
--> statement-breakpoint
ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor_recovery_codes" ADD CONSTRAINT "two_factor_recovery_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "two_factor_recovery_codes_user_id_idx" ON "two_factor_recovery_codes" USING btree ("user_id");