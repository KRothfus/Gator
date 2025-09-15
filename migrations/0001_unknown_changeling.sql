CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"feed_id" uuid NOT NULL,
	"published_at" timestamp NOT NULL,
	"description" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "posts_url_unique" UNIQUE("url")
);
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_feed_id_feeds_id_fk" FOREIGN KEY ("feed_id") REFERENCES "public"."feeds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;