-- Script para verificar o status Stripe de um profissional
-- Execute este script no seu banco de dados PostgreSQL

-- 1. Ver todos os profissionais e seus status Stripe
SELECT 
    p.id as professional_id,
    p.name as nome_profissional,
    u.email,
    u.id as user_id,
    p."stripeAccountId",
    p."stripeAccountStatus",
    p."stripeOnboardingCompleted",
    p."stripeDetailsSubmitted",
    p."stripeChargesEnabled",
    p."stripePayoutsEnabled"
FROM professionals p
JOIN users u ON u.id = p."userId"
ORDER BY p.id DESC;

-- 2. Ver profissionais SEM Stripe configurado
SELECT 
    p.id,
    p.name,
    u.email,
    'SEM STRIPE' as status
FROM professionals p
JOIN users u ON u.id = p."userId"
WHERE p."stripeAccountId" IS NULL;

-- 3. Ver profissionais COM Stripe configurado
SELECT 
    p.id,
    p.name,
    u.email,
    p."stripeAccountId",
    p."stripeAccountStatus",
    CASE 
        WHEN p."stripeChargesEnabled" = true THEN '✅ Pode receber pagamentos'
        ELSE '⏳ Aguardando ativação'
    END as pode_receber
FROM professionals p
JOIN users u ON u.id = p."userId"
WHERE p."stripeAccountId" IS NOT NULL;

