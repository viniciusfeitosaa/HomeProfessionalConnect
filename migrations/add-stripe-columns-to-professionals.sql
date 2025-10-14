-- Migração: Adicionar colunas do Stripe Connect na tabela professionals
-- Data: 2025-01-10
-- Autor: Sistema

-- Adicionar colunas do Stripe Connect
ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_account_status TEXT,
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE;

-- Criar índice para buscas rápidas por stripe_account_id
CREATE INDEX IF NOT EXISTS idx_professionals_stripe_account_id 
ON professionals(stripe_account_id);

-- Comentários nas colunas
COMMENT ON COLUMN professionals.stripe_account_id IS 'ID da conta Stripe Connect (formato: acct_xxxxx)';
COMMENT ON COLUMN professionals.stripe_account_status IS 'Status da conta: pending, active, inactive';
COMMENT ON COLUMN professionals.stripe_onboarding_completed IS 'Se o onboarding do Stripe foi completado';
COMMENT ON COLUMN professionals.stripe_details_submitted IS 'Se os detalhes foram submetidos ao Stripe';
COMMENT ON COLUMN professionals.stripe_charges_enabled IS 'Se pode receber pagamentos';
COMMENT ON COLUMN professionals.stripe_payouts_enabled IS 'Se pode fazer saques';

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'professionals'
  AND column_name LIKE 'stripe%'
ORDER BY column_name;

