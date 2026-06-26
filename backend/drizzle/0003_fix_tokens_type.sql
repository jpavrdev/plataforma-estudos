ALTER TABLE "tokens" ADD COLUMN IF NOT EXISTS "type" varchar(50) DEFAULT 'refresh' NOT NULL;
