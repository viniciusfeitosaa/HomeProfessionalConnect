-- Create payment_references table
CREATE TABLE "payment_references" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_request_id" integer NOT NULL,
	"service_offer_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"professional_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"preference_id" text NOT NULL UNIQUE,
	"status" text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
	"status_detail" text,
	"external_reference" text NOT NULL,
	"payment_id" text,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE "payment_references" ADD CONSTRAINT "payment_references_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE CASCADE;
ALTER TABLE "payment_references" ADD CONSTRAINT "payment_references_service_offer_id_fkey" FOREIGN KEY ("service_offer_id") REFERENCES "service_offers"("id") ON DELETE CASCADE;
ALTER TABLE "payment_references" ADD CONSTRAINT "payment_references_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "payment_references" ADD CONSTRAINT "payment_references_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "professionals"("id") ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX "payment_references_preference_id_idx" ON "payment_references"("preference_id");
CREATE INDEX "payment_references_external_reference_idx" ON "payment_references"("external_reference");
CREATE INDEX "payment_references_status_idx" ON "payment_references"("status");
