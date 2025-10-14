-- Migração: Adicionar colunas de dias e diária na tabela service_requests
-- Data: 2025-10-11

-- Adicionar colunas para serviços de múltiplos dias
ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS number_of_days INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(8,2);

-- Comentários nas colunas
COMMENT ON COLUMN service_requests.number_of_days IS 'Quantidade de dias que o serviço durará';
COMMENT ON COLUMN service_requests.daily_rate IS 'Valor da diária (por dia) do serviço';

-- Atualizar budget existente se tiver daily_rate (para consistência)
-- UPDATE service_requests SET budget = daily_rate * number_of_days WHERE daily_rate IS NOT NULL;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'service_requests'
  AND column_name IN ('number_of_days', 'daily_rate')
ORDER BY column_name;

