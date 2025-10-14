-- Migração: Adicionar coluna data na tabela notifications
-- Data: 2025-01-10

-- Adicionar coluna data (JSONB) para armazenar dados extras nas notificações
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS data JSONB;

-- Adicionar coluna actionUrl se não existir
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS "actionUrl" TEXT;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'notifications'
  AND column_name IN ('data', 'actionUrl')
ORDER BY column_name;

