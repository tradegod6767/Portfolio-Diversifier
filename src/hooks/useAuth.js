import { useState, useEffect, useRef } from 'react';
import { checkIfPro } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useProPolling } from './useProPolling';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proJustActivated, setProJustActivated] = useState(false);
  const prevIsProRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // getUser() validates the JWT server-side and refreshes it if expired, so the
    // Supabase client session is guaranteed live before checkIfPro queries the
    // RLS-gated user_subscriptions table. getSession() only reads localStorage and
    // was failing silently on refresh because the client session wasn't attached yet.
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!mounted) return;
      setUser(user ?? null);
      setLoading(false);
      if (user) {
        checkIfPro(user.id).then(({ isPro: fresh }) => {
          if (mounted) {
            setIsPro(fresh);
            prevIsProRef.current = fresh;
          }
        });
      }
    });

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        // DEV ONLY: localStorage override for testing Pro features without a real subscription.
        // Open the browser console and run: localStorage.setItem('dev_force_pro', 'true')
        // Then refresh. Remove with: localStorage.removeItem('dev_force_pro')
        const devForcePro = import.meta.env.DEV && localStorage.getItem('dev_force_pro') === 'true';

        let newIsPro = devForcePro;
        if (!devForcePro) {
          const { isPro: fresh } = await checkIfPro(u.id);
          newIsPro = fresh;
        }

        // DIAGNOSTIC — remove once Pro status is confirmed working
        console.log('[useAuth] onAuthStateChange event:', event, '| user:', u.email, '| isPro result:', newIsPro);

        if (mounted) {
          setIsPro(newIsPro);

          // Detect Pro activation: TOKEN_REFRESHED (webhook updated subscription)
          // or SIGNED_IN (user just logged in with is_pro already true)
          if (
            (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') &&
            !prevIsProRef.current &&
            newIsPro
          ) {
            setProJustActivated(true);
          }

          prevIsProRef.current = newIsPro;
        }
      } else {
        setIsPro(false);
        prevIsProRef.current = false;
      }

      setLoading(false); // always clear loading on every auth event
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function refetch() {
    if (user) {
      const { isPro: proStatus } = await checkIfPro(user.id);
      setIsPro(proStatus);
    }
  }

  function clearProActivated() {
    setProJustActivated(false);
  }

  // Poll only when user just returned from Gumroad checkout (?upgraded=true)
  useProPolling(user?.id, () => {
    if (user?.id) {
      checkIfPro(user.id).then(({ isPro: activatedPro }) => {
        setIsPro(activatedPro);
        if (activatedPro) {
          setProJustActivated(true);
          prevIsProRef.current = true;
        }
      });
    }
  });

  return { user, isPro, loading, refetch, proJustActivated, clearProActivated };
}
