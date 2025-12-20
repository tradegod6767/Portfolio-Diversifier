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

// Create Supabase client (use fallback values if missing to prevent crash)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      flowType: 'pkce', // Use PKCE flow
    },
    global: {
      fetch: (...args) => fetch(...args), // Use native fetch
    },
    db: {
      schema: 'public',
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
      console.log('[Auth] Checking for session...');

      // Try to read session from localStorage directly first
      const sessionKey = `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`;
      const storedSession = localStorage.getItem(sessionKey);

      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          if (parsed && parsed.user) {
            console.log('[Auth] Found session in localStorage:', parsed.user.email);
            return { user: parsed.user, error: null };
          }
        } catch (parseErr) {
          console.error('[Auth] Failed to parse stored session:', parseErr);
        }
      }

      console.log('[Auth] No session found in localStorage');
      return { user: null, error: null };
    } catch (err) {
      console.error('[Auth] getCurrentUser exception:', err);
      return { user: null, error: null };
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
