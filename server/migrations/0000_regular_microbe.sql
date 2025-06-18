CREATE TYPE "public"."capture_status" AS ENUM('pending', 'approved', 'denied');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('manager', 'patrol');--> statement-breakpoint
CREATE TABLE "captures" (
	"id" text PRIMARY KEY NOT NULL,
	"patrol_id" text NOT NULL,
	"pokemon_name" text NOT NULL,
	"location" text NOT NULL,
	"description" text,
	"element1" varchar NOT NULL,
	"element2" varchar,
	"image_file_type" varchar,
	"status" "capture_status" DEFAULT 'pending' NOT NULL,
	"processed_by_id" text,
	"processed_by_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'patrol' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "captures" ADD CONSTRAINT "captures_patrol_id_users_id_fk" FOREIGN KEY ("patrol_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;