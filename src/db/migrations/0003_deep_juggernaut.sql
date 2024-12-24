CREATE TABLE IF NOT EXISTS "forgot_pass_otp" (
	"id" integer PRIMARY KEY NOT NULL,
	"otp" varchar(6) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_verification_requests" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_verification_requests" ADD COLUMN "otp" varchar(6) NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "forgot_pass_otp" ADD CONSTRAINT "forgot_pass_otp_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
