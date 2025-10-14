-- Verificar status atual de todos os profissionais
SELECT 
  id,
  name,
  user_id,
  stripe_account_id,
  stripe_account_status,
  stripe_onboarding_completed,
  stripe_details_submitted,
  stripe_charges_enabled,
  stripe_payouts_enabled,
  stripe_connected_at,
  created_at
FROM professionals
ORDER BY id DESC;

