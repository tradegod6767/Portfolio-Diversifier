-- Migration 005: Cost basis + purchase date for positions
-- FOR REVIEW — do not apply until approved.
--
-- IMPORTANT SCHEMA NOTE: There is no `positions` table in this database.
-- Positions are stored as a JSONB array in portfolios.positions (see
-- 003_portfolios.sql / 20250101000000_portfolio_schema.sql), and free users'
-- portfolios live in browser localStorage and never touch Postgres at all.
--
-- Therefore no ALTER TABLE ... ADD COLUMN applies. Instead, each element of
-- the portfolios.positions array gains two OPTIONAL keys written by the app:
--
--   costBasis    string|null  Total dollars the user paid for the position,
--                             stored as a numeric string ("8000"), matching
--                             how `amount` and `targetPercent` are stored.
--   purchaseDate string|null  ISO date 'YYYY-MM-DD'.
--
-- Existing rows (and localStorage portfolios) simply lack these keys, which
-- the app reads as "unknown" and falls back to the assumed-basis estimate —
-- no data migration or backfill is needed.
--
-- This migration only documents the new shape on the column so it is
-- discoverable from the database side. If you would rather normalize
-- positions into a real table with typed cost_basis NUMERIC and
-- purchase_date DATE columns, that is a larger restructuring (new table,
-- RLS policies, app-wide query changes, data backfill) — say the word and
-- I'll draft it separately.

COMMENT ON COLUMN portfolios.positions IS
  'JSONB array of positions: [{ticker, amount, targetPercent, costBasis?, purchaseDate?}]. '
  'costBasis = total $ paid for the position (numeric string, > 0); '
  'purchaseDate = YYYY-MM-DD, not in the future. Both optional — when absent, '
  'the tax estimate falls back to an assumed 80% cost basis and marks the '
  'figure as estimated in the UI.';
