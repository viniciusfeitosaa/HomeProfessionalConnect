-- Migration: Add service_reviews table
-- This table stores client reviews for completed services

CREATE TABLE IF NOT EXISTS "service_reviews" (
  "id" serial PRIMARY KEY,
  "service_request_id" integer NOT NULL,
  "service_offer_id" integer NOT NULL,
  "client_id" integer NOT NULL,
  "professional_id" integer NOT NULL,
  "rating" integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "comment" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "service_reviews_professional_id_idx" ON "service_reviews" ("professional_id");
CREATE INDEX IF NOT EXISTS "service_reviews_client_id_idx" ON "service_reviews" ("client_id");
CREATE INDEX IF NOT EXISTS "service_reviews_service_request_id_idx" ON "service_reviews" ("service_request_id");
CREATE INDEX IF NOT EXISTS "service_reviews_rating_idx" ON "service_reviews" ("rating");
CREATE INDEX IF NOT EXISTS "service_reviews_created_at_idx" ON "service_reviews" ("created_at");

-- Add foreign key constraints
ALTER TABLE "service_reviews" ADD CONSTRAINT "service_reviews_service_request_id_fkey" 
  FOREIGN KEY ("service_request_id") REFERENCES "service_requests" ("id") ON DELETE CASCADE;

ALTER TABLE "service_reviews" ADD CONSTRAINT "service_reviews_service_offer_id_fkey" 
  FOREIGN KEY ("service_offer_id") REFERENCES "service_offers" ("id") ON DELETE CASCADE;

ALTER TABLE "service_reviews" ADD CONSTRAINT "service_reviews_client_id_fkey" 
  FOREIGN KEY ("client_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "service_reviews" ADD CONSTRAINT "service_reviews_professional_id_fkey" 
  FOREIGN KEY ("professional_id") REFERENCES "professionals" ("id") ON DELETE CASCADE;

-- Add unique constraint to prevent multiple reviews for the same service by the same client
ALTER TABLE "service_reviews" ADD CONSTRAINT "service_reviews_unique_service_client" 
  UNIQUE ("service_request_id", "client_id");
