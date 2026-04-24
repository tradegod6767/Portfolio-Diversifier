import { useState, useEffect, useRef } from 'react';
import { checkIfPro } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useProPolling } from './useProPolling';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proJustActivated, setProJustActivated] = useState(false);
  // Tracks the last known isPro value so we can detect false → true transitions
  const prevIsProRef = useRef(false);
  // Tracks the background Pro polling interval so we can cancel it
  const proPollingRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    // Poll the user_subscriptions table every 5s for up to 60s to detect Pro upgrades.
    // Guards against double-start — only one polling loop runs at a time.
    function startProPolling(userId) {
      if (proPollingRef.current) return;

      let attempts = 0;
      const maxAttempts = 12; // 12 × 5s = 60s

      proPollingRef.current = setInterval(async () => {
        if (!mounted) {
          clearInterval(proPollingRef.current);
          proPollingRef.current = null;
          return;
        }

        attempts++;
        console.log('[Pro Poll] checking... isPro: false');

        if (attempts > maxAttempts) {
          clearInterval(proPollingRef.current);
          proPollingRef.current = null;
          return;
        }

        try {
          const { isPro: hasActiveSub } = await checkIfPro(userId);

          if (!mounted) {
            clearInterval(proPollingRef.current);
            proPollingRef.current = null;
            return;
          }

          if (hasActiveSub) {
            console.log('[Pro Poll] detected Pro upgrade!');
            clearInterval(proPollingRef.current);
            proPollingRef.current = null;
            setIsPro(true);
            setProJustActivated(true);
            prevIsProRef.current = true;
          }
        } catch {
          // Silently ignore polling errors
        }
      }, 5000);
    }

    // Rely solely on onAuthStateChange for auth initialization.
    // Do NOT call getCurrentUser() eagerly — on hard refresh the Supabase session
    // is not yet restored from localStorage when the component mounts, so
    // getCurrentUser() returns null and checkIfPro() never runs.
    // INITIAL_SESSION is the guaranteed signal that session rehydration is done.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const newUser = session?.user ?? null;
      setUser(newUser);

      if (newUser) {
        // DEV ONLY: localStorage override for testing Pro features without a real subscription.
        // Open the browser console and run: localStorage.setItem('dev_force_pro', 'true')
        // Then refresh. Remove with: localStorage.removeItem('dev_force_pro')
        const devForcePro = import.meta.env.DEV && localStorage.getItem('dev_force_pro') === 'true';

        // Always query the DB — never short-circuit with prevIsProRef on INITIAL_SESSION.
        // The ref is still false at that point (no earlier check ran), so skipping the
        // DB call is what caused the hard-refresh race condition.
        let newIsPro = devForcePro;
        if (!devForcePro) {
          const { isPro: fresh } = await checkIfPro(newUser.id, session);
          newIsPro = fresh;
        }

        if (mounted) {
          setIsPro(newIsPro);

          // Detect Pro activation on an active session:
          // - TOKEN_REFRESHED: webhook updated subscription, polling detected it
          // - SIGNED_IN: user just logged in with is_pro already true (fresh purchase)
          if (
            (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') &&
            !prevIsProRef.current &&
            newIsPro
          ) {
            setProJustActivated(true);
          }

          prevIsProRef.current = newIsPro;

          // Start background polling on any tab where user is logged in but not yet Pro
          if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && !newIsPro) {
            startProPolling(newUser.id);
          }

          // Stop polling as soon as Pro is confirmed
          if (newIsPro && proPollingRef.current) {
            clearInterval(proPollingRef.current);
            proPollingRef.current = null;
          }
        }
      } else {
        setIsPro(false);
        prevIsProRef.current = false;
        if (proPollingRef.current) {
          clearInterval(proPollingRef.current);
          proPollingRef.current = null;
        }
      }

      // Resolve the loading spinner once auth state is definitively known.
      // INITIAL_SESSION fires when session rehydration completes (logged in or out).
      // SIGNED_OUT covers explicit logout after initial load.
      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') && mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (proPollingRef.current) {
        clearInterval(proPollingRef.current);
        proPollingRef.current = null;
      }
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

  // Wire up polling only when user just returned from Gumroad checkout (?upgraded=true)
  useProPolling(user?.id, () => {
    // Refresh pro status when polling detects activation
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
