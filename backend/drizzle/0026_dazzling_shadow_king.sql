CREATE TABLE "glossary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"term" varchar(60) NOT NULL,
	"definition" varchar(400) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "glossary_term_unique" UNIQUE("term")
);
