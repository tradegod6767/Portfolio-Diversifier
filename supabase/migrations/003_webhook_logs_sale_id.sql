ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS sale_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_logs_sale_id ON webhook_logs(sale_id);
