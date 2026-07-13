CREATE TABLE "trail_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trail_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"stars" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trail_reviews_user_id_trail_id_unique" UNIQUE("user_id","trail_id")
);
--> statement-breakpoint
ALTER TABLE "trail_reviews" ADD CONSTRAINT "trail_reviews_trail_id_trails_id_fk" FOREIGN KEY ("trail_id") REFERENCES "public"."trails"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trail_reviews" ADD CONSTRAINT "trail_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;