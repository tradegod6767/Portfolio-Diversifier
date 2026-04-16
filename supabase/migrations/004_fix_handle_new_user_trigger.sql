-- Migration: Fix handle_new_user trigger to stop resetting Pro status on login
--
-- Bug: On every login/refresh, Pro users' is_pro was being reset to false.
--
-- Root cause: The handle_new_user() function was either:
--   (a) using ON CONFLICT (user_id) DO UPDATE SET is_pro = false (overwrites Pro on any auth event)
--   (b) firing on INSERT OR UPDATE instead of INSERT only (fires on login when Supabase
--       updates last_sign_in_at in auth.users, upserts with default is_pro = false)
--
-- Fix:
--   1. Rewrite handle_new_user() to use ON CONFLICT DO NOTHING — never overwrites existing rows
--   2. Drop and recreate the trigger to fire only on INSERT (new user creation), not UPDATE

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create a subscription row for brand-new users.
  -- ON CONFLICT DO NOTHING ensures we NEVER touch an existing row,
  -- so a Pro user's is_pro value is never overwritten by this trigger.
  INSERT INTO public.user_subscriptions (user_id, is_pro, subscription_status)
  VALUES (NEW.id, false, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop and recreate trigger to ensure it fires on INSERT only.
-- Previously may have been AFTER INSERT OR UPDATE, which fires on every login
-- (Supabase updates last_sign_in_at on auth.users on each sign-in).
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
