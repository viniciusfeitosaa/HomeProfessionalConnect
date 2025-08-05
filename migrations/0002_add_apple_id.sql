-- Adicionar coluna apple_id à tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS apple_id TEXT UNIQUE; 