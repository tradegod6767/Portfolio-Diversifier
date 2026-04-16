CREATE TABLE IF NOT EXISTS pending_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  sale_id TEXT NOT NULL UNIQUE,
  gumroad_subscription_id TEXT,
  gumroad_product_id TEXT,
  purchase_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired')),
  claimed_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pending_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON pending_purchases FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_pending_purchases_email ON pending_purchases(email);
CREATE INDEX IF NOT EXISTS idx_pending_purchases_status ON pending_purchases(status);
