-- Migration: Fix mutable search_path security warnings
-- Date: 2025-01-26
-- Issue: Functions with SECURITY DEFINER should have immutable search_path
--        to prevent path manipulation attacks

-- Fix handle_new_user function
-- This function is triggered when a new user signs up
ALTER FUNCTION public.handle_new_user()
  SECURITY DEFINER
  SET search_path = public;

-- Fix update_updated_at_column function
-- This function updates the updated_at timestamp on row changes
ALTER FUNCTION public.update_updated_at_column()
  SECURITY DEFINER
  SET search_path = public;

-- Verify the fixes (optional - run separately to check)
-- SELECT proname, prosecdef, proconfig
-- FROM pg_proc
-- WHERE proname IN ('handle_new_user', 'update_updated_at_column');
