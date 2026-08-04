CREATE TABLE "community_comment_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_comment_likes_comment_id_user_id_unique" UNIQUE("comment_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "community_comments" ADD COLUMN "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "community_comment_likes" ADD CONSTRAINT "community_comment_likes_comment_id_community_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."community_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comment_likes" ADD CONSTRAINT "community_comment_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "community_comment_likes_user_id_idx" ON "community_comment_likes" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_parent_id_community_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."community_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "community_comments_parent_id_idx" ON "community_comments" USING btree ("parent_id");