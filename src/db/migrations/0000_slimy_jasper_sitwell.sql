DO $$ BEGIN
 CREATE TYPE "public"."lang" AS ENUM('Hindi', 'Telugu', 'Tamil', 'Bengali', 'Kannada', 'Gujarati', 'Malayalam', 'Odia', 'Sinhala');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_type" AS ENUM('admin', 'non-admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "translations" (
	"lang" "lang" NOT NULL,
	"kANDa_num" smallint NOT NULL,
	"sarga_num" smallint NOT NULL,
	"shloka_num" smallint NOT NULL,
	"text" text DEFAULT '',
	CONSTRAINT "translations_lang_kANDa_num_sarga_num_shloka_num_pk" PRIMARY KEY("lang","kANDa_num","sarga_num","shloka_num")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_verification_requests" (
	"id" integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_name" varchar(50) NOT NULL,
	"user_id" varchar(25) NOT NULL,
	"user_email" text NOT NULL,
	"password_hash" varchar(96) NOT NULL,
	"contact_number" varchar(17),
	"user_type" "user_type" DEFAULT 'non-admin' NOT NULL,
	"allowed_langs" lang[],
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "users_user_email_unique" UNIQUE("user_email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_verification_requests" ADD CONSTRAINT "user_verification_requests_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
