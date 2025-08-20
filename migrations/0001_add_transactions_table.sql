-- Migration: Add transactions table
-- Date: 2025-01-27

-- Create transactions table
CREATE TABLE IF NOT EXISTS "transactions" (
  "id" serial PRIMARY KEY,
  "service_request_id" integer NOT NULL,
  "service_offer_id" integer NOT NULL,
  "client_id" integer NOT NULL,
  "professional_id" integer NOT NULL,
  "amount" decimal(10,2) NOT NULL,
  "status" text NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'completed', 'failed', 'refunded')),
  "type" text NOT NULL DEFAULT 'service_payment' CHECK ("type" IN ('service_payment', 'refund', 'bonus')),
  "description" text,
  "payment_method" text CHECK ("payment_method" IN ('pix', 'credit_card', 'debit_card', 'bank_transfer')),
  "transaction_id" text,
  "completed_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "transactions_professional_id_idx" ON "transactions" ("professional_id");
CREATE INDEX IF NOT EXISTS "transactions_client_id_idx" ON "transactions" ("client_id");
CREATE INDEX IF NOT EXISTS "transactions_service_request_id_idx" ON "transactions" ("service_request_id");
CREATE INDEX IF NOT EXISTS "transactions_status_idx" ON "transactions" ("status");
CREATE INDEX IF NOT EXISTS "transactions_created_at_idx" ON "transactions" ("created_at");

-- Add foreign key constraints
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_service_request_id_fkey" 
  FOREIGN KEY ("service_request_id") REFERENCES "service_requests" ("id") ON DELETE CASCADE;

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_service_offer_id_fkey" 
  FOREIGN KEY ("service_offer_id") REFERENCES "service_offers" ("id") ON DELETE CASCADE;

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_client_id_fkey" 
  FOREIGN KEY ("client_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_professional_id_fkey" 
  FOREIGN KEY ("professional_id") REFERENCES "professionals" ("id") ON DELETE CASCADE;
