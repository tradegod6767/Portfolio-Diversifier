import { useState, useEffect, useCallback, useRef } from 'react';
import { auth, subscriptions } from '../lib/supabase';

/**
 * Custom hook to manage user authentication and subscription status
 * @returns {Object} { user, subscription, isPro, loading, refetch }
 */
export function useSubscription() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  // Fetch subscription data for a given user (memoized)
  const fetchSubscription = useCallback(async (userId) => {
    if (!userId) {
      setSubscription(null);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log('[useSubscription] Already fetching, skipping...');
      return;
    }

    isFetchingRef.current = true;

    try {
      const { data, error } = await subscriptions.getSubscription(userId);

      if (error) {
        console.error('[useSubscription] Error fetching subscription:', error);
        setSubscription(null);
      } else {
        setSubscription(data);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Initialize and listen for auth state changes
  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (hasInitializedRef.current) {
      console.log('[useSubscription] Already initialized, skipping...');
      return;
    }
    hasInitializedRef.current = true;

    let mounted = true;

    // Get initial user
    const initializeAuth = async () => {
      setLoading(true);
      console.log('[useSubscription] Initializing auth...');

      try {
        const { user: currentUser, error } = await auth.getCurrentUser();

        if (error) {
          console.error('[useSubscription] Auth error:', error.message);
        }

        if (!mounted) return;

        setUser(currentUser);

        if (currentUser) {
          console.log('[useSubscription] User logged in, fetching subscription...');
          await fetchSubscription(currentUser.id);
        }

        setLoading(false);
        console.log('[useSubscription] Auth initialized');
      } catch (error) {
        console.error('[useSubscription] Auth initialization failed:', error);
        if (mounted) {
          setUser(null);
          setSubscription(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: authListener } = auth.onAuthStateChange(async (event, session) => {
      console.log('[useSubscription] Auth state changed:', event);

      if (!mounted) return;

      // Skip INITIAL_SESSION to avoid duplicate fetch
      if (event === 'INITIAL_SESSION') {
        console.log('[useSubscription] Skipping INITIAL_SESSION (already handled)');
        return;
      }

      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        await fetchSubscription(currentUser.id);
      } else {
        setSubscription(null);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchSubscription]);

  // Manual refetch function (memoized)
  const refetch = useCallback(async () => {
    if (user) {
      await fetchSubscription(user.id);
    }
  }, [user, fetchSubscription]);

  // Calculate isPro status
  const isPro = subscriptions.isPro(subscription);

  return {
    user,
    subscription,
    isPro,
    loading,
    refetch,
  };
}
