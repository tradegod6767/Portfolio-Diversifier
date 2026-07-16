import { createContext, useState, useEffect, useRef } from 'react';
import { checkIfPro } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useProPolling } from '../hooks/useProPolling';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [proJustActivated, setProJustActivated] = useState(false);
  const prevIsProRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // DIAGNOSTIC — remove once Pro status is confirmed working on refresh
    console.log('[useAuth] effect running, setting up auth');

    // Primary path: getUser() hits the Supabase server, validates the JWT,
    // and refreshes it if expired — guaranteeing the client session is live
    // before checkIfPro queries the RLS-gated user_subscriptions table.
    async function loadInitialAuth() {
      const { data: { user: u }, error } = await supabase.auth.getUser();
      console.log('[useAuth] getUser() →', u ? u.email : 'null', error ? error.message : 'no error');
      if (!mounted) return;

      setUser(u ?? null);
      setLoading(false);

      if (u) {
        const { isPro: fresh, subscriptionStatus } = await checkIfPro(u.id);
        console.log('[useAuth] initial checkIfPro →', { isPro: fresh, subscriptionStatus });
        if (mounted) {
          setIsPro(fresh);
          prevIsProRef.current = fresh;
        }
      }
    }

    loadInitialAuth();

    // Secondary path: keep Pro status in sync for the rest of the session
    // (login, logout, token refresh). INITIAL_SESSION is handled by loadInitialAuth()
    // above, but we still process it here to keep setUser/setLoading consistent.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // DIAGNOSTIC — remove once Pro status is confirmed working on refresh
      console.log('[useAuth] raw event:', event, 'session:', session);
      if (!mounted) return;
      const u = session?.user ?? null;
      console.log('[useAuth] onAuthStateChange:', event, u ? u.email : 'no user');

      setUser(u);

      if (u) {
        // DEV ONLY: localStorage override for testing Pro without a real subscription.
        // Browser console: localStorage.setItem('dev_force_pro', 'true') then refresh.
        const devForcePro = import.meta.env.DEV && localStorage.getItem('dev_force_pro') === 'true';

        let newIsPro = devForcePro;
        if (!devForcePro) {
          // DIAGNOSTIC — remove once Pro status is confirmed working on refresh
          const callId = Math.random().toString(36).slice(2, 8);
          console.log('[useAuth] checkIfPro call START', callId, { event });
          try {
            const { isPro: fresh } = await checkIfPro(u.id);
            console.log('[useAuth] checkIfPro call END', callId, { event, isPro: fresh });
            newIsPro = fresh;
          } catch (err) {
            console.error('[useAuth] checkIfPro call ERRORED', callId, err);
          }
        } else {
          console.log('[useAuth] onAuthStateChange devForcePro active, skipping checkIfPro');
        }

        if (mounted) {
          setIsPro(newIsPro);

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

      setLoading(false);
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

  return (
    <AuthContext.Provider
      value={{ user, isPro, loading, refetch, proJustActivated, clearProActivated }}
    >
      {children}
    </AuthContext.Provider>
  );
}
