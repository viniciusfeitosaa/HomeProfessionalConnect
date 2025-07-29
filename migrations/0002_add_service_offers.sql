CREATE TABLE "service_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_request_id" integer NOT NULL,
	"professional_id" integer NOT NULL,
	"proposed_price" numeric(8, 2) NOT NULL,
	"estimated_time" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
); 