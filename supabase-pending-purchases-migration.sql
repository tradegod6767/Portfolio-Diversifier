-- Migration: Add pending_purchases table for orphaned Gumroad purchases
-- Run this in Supabase SQL editor

-- Table to store purchases made by users who don't have an account yet
CREATE TABLE IF NOT EXISTS pending_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  gumroad_sale_id TEXT,
  gumroad_subscription_id TEXT,
  product_name TEXT,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'USD',
  payload JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  claimed_by_user_id UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_pending_purchases_email ON pending_purchases(email);
CREATE INDEX IF NOT EXISTS idx_pending_purchases_status ON pending_purchases(status);

-- RLS policies
ALTER TABLE pending_purchases ENABLE ROW LEVEL SECURITY;

-- Only service role can manage pending purchases (for webhook and claim API)
CREATE POLICY "Service role manages pending purchases" ON pending_purchases
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Function to auto-claim pending purchases on signup
-- This can be called from the claim-pending-purchase API endpoint
CREATE OR REPLACE FUNCTION claim_pending_purchase(p_email TEXT, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_purchase pending_purchases%ROWTYPE;
  v_result JSONB;
BEGIN
  -- Find pending purchase for this email
  SELECT * INTO v_purchase
  FROM pending_purchases
  WHERE email = LOWER(p_email)
    AND status = 'pending'
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_purchase.id IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  -- Mark as claimed
  UPDATE pending_purchases
  SET status = 'claimed',
      claimed_at = NOW(),
      claimed_by_user_id = p_user_id
  WHERE id = v_purchase.id;

  RETURN jsonb_build_object(
    'found', true,
    'purchase_id', v_purchase.id,
    'gumroad_subscription_id', v_purchase.gumroad_subscription_id,
    'product_name', v_purchase.product_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (will be called via service role anyway)
GRANT EXECUTE ON FUNCTION claim_pending_purchase(TEXT, UUID) TO service_role;

COMMENT ON TABLE pending_purchases IS 'Stores Gumroad purchases for emails without accounts. Auto-claimed when user signs up.';
