import { useState, useEffect } from 'react';
import { auth, subscriptions } from '../lib/supabase';

/**
 * Custom hook to manage user authentication and subscription status
 * @returns {Object} { user, subscription, isPro, loading, refetch }
 */
export function useSubscription() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch subscription data for a given user
  const fetchSubscription = async (userId) => {
    if (!userId) {
      setSubscription(null);
      return;
    }

    const { data, error } = await subscriptions.getSubscription(userId);

    if (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } else {
      setSubscription(data);
    }
  };

  // Initialize and listen for auth state changes
  useEffect(() => {
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
  }, []);

  // Manual refetch function
  const refetch = async () => {
    if (user) {
      await fetchSubscription(user.id);
    }
  };

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
