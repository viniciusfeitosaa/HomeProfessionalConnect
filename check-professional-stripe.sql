-- Verificar qual profissional está na proposta ID 14 e se tem Stripe Connect

SELECT 
    so.id as proposta_id,
    so.professional_id,
    p.name as profissional_nome,
    p.user_id,
    u.email as profissional_email,
    p.stripe_account_id,
    p.stripe_charges_enabled,
    CASE 
        WHEN p.stripe_account_id IS NULL THEN '❌ NÃO CONECTADO'
        WHEN p.stripe_charges_enabled = true THEN '✅ ATIVO'
        ELSE '⚠️ PENDENTE'
    END as status_stripe
FROM service_offers so
JOIN professionals p ON p.id = so.professional_id
JOIN users u ON u.id = p.user_id
WHERE so.id = 14;

-- Ver todos os profissionais e status Stripe
SELECT 
    p.id,
    p.name,
    u.email,
    p.stripe_account_id,
    p.stripe_account_status,
    p.stripe_charges_enabled
FROM professionals p
JOIN users u ON u.id = p.user_id
ORDER BY p.id;

