-- Migration: Add type, title, and actionUrl fields to notifications table
-- Date: 2025-10-07

-- Add type column (default 'info')
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'info';

-- Add title column
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';

-- Add action_url column (nullable)
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS action_url TEXT;

-- Update existing notifications to have a default title
UPDATE notifications 
SET title = 'Notificação' 
WHERE title IS NULL OR title = '';

