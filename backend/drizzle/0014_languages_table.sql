CREATE TABLE "languages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(60) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "languages_name_unique" UNIQUE("name")
);
--> statement-breakpoint
INSERT INTO "languages" ("name") VALUES
('JavaScript'),('TypeScript'),('Python'),('Java'),('C#'),('C++'),('C'),('Go'),('Rust'),('Ruby'),('PHP'),('Swift'),('Kotlin'),('Dart'),('Scala'),('R'),('SQL'),('HTML'),('CSS'),('Shell'),('Lua'),('Elixir'),('Haskell'),('Clojure'),('Objective-C'),('Perl')
ON CONFLICT ("name") DO NOTHING;
