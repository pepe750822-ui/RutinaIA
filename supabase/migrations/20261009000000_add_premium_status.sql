-- Add 'premium' to instructors.subscription_status (Mercado Pago billing)
ALTER TABLE instructors
  DROP CONSTRAINT IF EXISTS instructors_subscription_status_check;

ALTER TABLE instructors
  ADD CONSTRAINT instructors_subscription_status_check
  CHECK (subscription_status IN ('inactive','active','trialing','past_due','canceled','premium'));
