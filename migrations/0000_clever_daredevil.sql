CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"professional_id" integer NOT NULL,
	"professional_name" text NOT NULL,
	"service_type" text NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"total_cost" numeric(8, 2),
	"status" text DEFAULT 'pending',
	"notes" text,
	"address" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"professional_id" integer NOT NULL,
	"deleted_by_client" boolean DEFAULT false,
	"deleted_by_professional" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"successful" boolean DEFAULT false NOT NULL,
	"blocked" boolean DEFAULT false NOT NULL,
	"attempted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"recipient_id" integer NOT NULL,
	"content" text NOT NULL,
	"type" text DEFAULT 'text',
	"timestamp" timestamp DEFAULT now(),
	"is_read" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "professionals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"specialization" text NOT NULL,
	"category" text NOT NULL,
	"sub_category" text NOT NULL,
	"description" text NOT NULL,
	"experience" text,
	"certifications" text,
	"available_hours" text,
	"hourly_rate" numeric(8, 2),
	"rating" numeric(2, 1) DEFAULT '5.0',
	"total_reviews" integer DEFAULT 0,
	"location" text,
	"distance" numeric(3, 1),
	"available" boolean DEFAULT true NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_request_id" integer NOT NULL,
	"professional_id" integer NOT NULL,
	"proposed_price" numeric(8, 2) NOT NULL,
	"final_price" numeric(8, 2),
	"estimated_time" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_request_id" integer NOT NULL,
	"professional_id" integer NOT NULL,
	"status" text DEFAULT 'accepted' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"confirmed_at" timestamp,
	"payment_released_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"service_type" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"address" text NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"scheduled_time" text NOT NULL,
	"urgency" text DEFAULT 'medium',
	"budget" numeric(8, 2),
	"status" text DEFAULT 'open',
	"assigned_professional_id" integer,
	"responses" integer DEFAULT 0,
	"service_started_at" timestamp,
	"service_completed_at" timestamp,
	"client_confirmed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text,
	"google_id" text,
	"apple_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"phone_verified" boolean DEFAULT false,
	"address" text,
	"profile_image" text,
	"user_type" text DEFAULT 'client' NOT NULL,
	"is_verified" boolean DEFAULT false,
	"is_blocked" boolean DEFAULT false,
	"last_login_at" timestamp,
	"login_attempts" integer DEFAULT 0,
	"reset_token" text,
	"reset_token_expiry" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_apple_id_unique" UNIQUE("apple_id")
);
--> statement-breakpoint
CREATE TABLE "verification_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"email" text,
	"phone" text,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
