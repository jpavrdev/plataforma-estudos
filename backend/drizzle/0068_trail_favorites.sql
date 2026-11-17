CREATE TABLE "trail_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trail_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trail_favorites_trail_id_user_id_unique" UNIQUE("trail_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "trail_favorites" ADD CONSTRAINT "trail_favorites_trail_id_trails_id_fk" FOREIGN KEY ("trail_id") REFERENCES "public"."trails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trail_favorites" ADD CONSTRAINT "trail_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "trail_favorites_user_id_idx" ON "trail_favorites" USING btree ("user_id");