-- Adicionar campos Stripe Connect à tabela professionals
-- Data: 2025-01-10
-- Migração: Stripe Connect Integration

ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS stripe_account_status VARCHAR(50) DEFAULT 'not_connected',
ADD COLUMN IF NOT EXISTS stripe_onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_connected_at TIMESTAMP NULL;

-- Criar índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_professionals_stripe_account 
ON professionals(stripe_account_id);

CREATE INDEX IF NOT EXISTS idx_professionals_stripe_status 
ON professionals(stripe_account_status);

-- Comentários para documentação
COMMENT ON COLUMN professionals.stripe_account_id IS 'ID da conta Stripe Connect do profissional (acct_xxx)';
COMMENT ON COLUMN professionals.stripe_account_status IS 'Status da conta: not_connected, pending, active, restricted';
COMMENT ON COLUMN professionals.stripe_onboarding_completed IS 'Se profissional completou onboarding do Stripe';
COMMENT ON COLUMN professionals.stripe_details_submitted IS 'Se detalhes foram enviados ao Stripe';
COMMENT ON COLUMN professionals.stripe_charges_enabled IS 'Se pode receber pagamentos';
COMMENT ON COLUMN professionals.stripe_payouts_enabled IS 'Se pode fazer saques';
COMMENT ON COLUMN professionals.stripe_connected_at IS 'Data/hora que conectou Stripe';

