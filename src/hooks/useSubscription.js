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

    // Timeout fallback - stop loading after 2 seconds no matter what
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timed out - assuming no user');
        setLoading(false);
        setUser(null);
        setSubscription(null);
      }
    }, 2000); // Reduced to 2 seconds

    // Get initial user
    const initializeAuth = async () => {
      setLoading(true);
      console.log('[useSubscription] Starting auth initialization...');
      try {
        console.log('[useSubscription] Calling getCurrentUser...');

        // Wrap getCurrentUser with a timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('getCurrentUser timed out')), 1500)
        );

        const authPromise = auth.getCurrentUser();

        const { user: currentUser, error } = await Promise.race([authPromise, timeoutPromise])
          .catch(err => {
            console.error('[useSubscription] Auth call timed out or failed:', err);
            return { user: null, error: err };
          });

        console.log('[useSubscription] getCurrentUser response:', {
          hasUser: !!currentUser,
          hasError: !!error,
          errorMessage: error?.message
        });

        if (error) {
          console.error('[useSubscription] Auth error:', error);
        }

        if (mounted) {
          setUser(currentUser);
          if (currentUser) {
            console.log('[useSubscription] Fetching subscription for user:', currentUser.id);
            await fetchSubscription(currentUser.id);
          }
          clearTimeout(timeout);
          setLoading(false);
          console.log('[useSubscription] Auth initialization complete');
        }
      } catch (error) {
        console.error('[useSubscription] Failed to initialize auth:', error);
        if (mounted) {
          clearTimeout(timeout);
          setLoading(false); // Stop loading even on error
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: authListener } = auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          await fetchSubscription(currentUser.id);
        } else {
          setSubscription(null);
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
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
