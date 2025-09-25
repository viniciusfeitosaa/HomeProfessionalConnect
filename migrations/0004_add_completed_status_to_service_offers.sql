-- Migration: Add 'completed' status to service_offers table
-- Date: 2025-01-24

-- Update the status column to include 'completed' and 'paid' statuses
ALTER TABLE service_offers 
ALTER COLUMN status TYPE text 
USING status::text;

-- Add check constraint to ensure only valid statuses
ALTER TABLE service_offers 
ADD CONSTRAINT service_offers_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn', 'paid', 'completed'));

-- Update existing records if needed (optional)
-- UPDATE service_offers SET status = 'completed' WHERE status = 'accepted' AND payment_received = true;
