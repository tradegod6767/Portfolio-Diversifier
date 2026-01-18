import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client with proper Vercel edge configuration
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      // Remove custom storageKey - let Supabase use the default
      // This fixes sign out hanging issues
    },
    global: {
      headers: {
        'x-application-name': 'rebalancekit',
      },
    },
    realtime: {
      enabled: false, // Disable realtime to reduce overhead
    },
  }
);

// Helper functions for auth
export const auth = {
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) return { user: null, error };
      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: { message: err.message } };
    }
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Helper functions for subscription data
export const subscriptions = {
  getSubscription: async (userId) => {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  isPro: (subscription) => {
    if (!subscription) return false;
    if (subscription.subscription_status !== 'active') return false;
    if (!subscription.current_period_end) return false;

    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    return endDate > now;
  },
};
