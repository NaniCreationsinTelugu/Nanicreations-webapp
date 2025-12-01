CREATE TABLE "course_video" (
	"id" integer PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"title" text NOT NULL,
	"youtube_url" text NOT NULL,
	"duration" text,
	"order" integer NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "enrollment" (
	"id" integer PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" integer NOT NULL,
	"enrolled_at" text NOT NULL,
	"payment_session_id" text
);
--> statement-breakpoint
CREATE TABLE "payment_session" (
	"id" integer PRIMARY KEY NOT NULL,
	"stripe_session_id" text NOT NULL,
	"user_id" text NOT NULL,
	"course_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" text NOT NULL,
	"created_at" text NOT NULL,
	"completed_at" text,
	CONSTRAINT "payment_session_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "thumbnail" text;--> statement-breakpoint
ALTER TABLE "course_video" ADD CONSTRAINT "course_video_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_session" ADD CONSTRAINT "payment_session_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "course_video_course_idx" ON "course_video" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_video_order_idx" ON "course_video" USING btree ("course_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollment_user_course_idx" ON "enrollment" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "enrollment_course_idx" ON "enrollment" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_session_stripe_idx" ON "payment_session" USING btree ("stripe_session_id");