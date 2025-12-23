import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[Supabase Init] Environment check:', {
  supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
  supabaseAnonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
  supabaseUrlLength: supabaseUrl?.length,
  supabaseAnonKeyLength: supabaseAnonKey?.length,
  allEnvVars: Object.keys(import.meta.env),
});

// Validate that the values are complete strings, not just truncated
if (supabaseUrl && supabaseUrl.length < 40) {
  console.error('[Supabase Init] WARNING: supabaseUrl seems too short!', supabaseUrl);
}
if (supabaseAnonKey && supabaseAnonKey.length < 100) {
  console.error('[Supabase Init] WARNING: supabaseAnonKey seems too short!', supabaseAnonKey);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    supabaseUrl: supabaseUrl ? 'SET' : 'MISSING',
    supabaseAnonKey: supabaseAnonKey ? 'SET' : 'MISSING',
  });
  console.warn('Using fallback values - authentication will not work properly');
}

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
    console.log('[Auth] Getting current user...');

    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('[Auth] getUser error:', error.message);
        return { user: null, error };
      }

      console.log('[Auth] User check complete:', data.user ? data.user.email : 'No user');
      return { user: data.user, error: null };
    } catch (err) {
      console.error('[Auth] getCurrentUser exception:', err.message);
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
