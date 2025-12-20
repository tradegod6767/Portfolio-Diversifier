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
      console.log('[Auth] Fetching current user from Supabase...');
      console.log('[Auth] Using URL:', supabaseUrl);

      // Test basic connectivity first with a simple fetch with API key
      console.log('[Auth] Testing basic connectivity with API key...');
      try {
        const testResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
          method: 'GET',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        console.log('[Auth] User endpoint test response:', testResponse.status);
        const testData = await testResponse.json();
        console.log('[Auth] User endpoint test data:', testData);
      } catch (fetchErr) {
        console.error('[Auth] User endpoint test failed:', fetchErr);
      }

      // Now try the actual auth call with a timeout
      console.log('[Auth] Calling supabase.auth.getUser()...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        clearTimeout(timeoutId);

        console.log('[Auth] getCurrentUser result:', {
          hasUser: !!user,
          error: error?.message,
          errorDetails: error
        });
        return { user, error };
      } catch (authErr) {
        clearTimeout(timeoutId);
        console.error('[Auth] Auth call failed:', authErr);
        return { user: null, error: authErr };
      }
    } catch (err) {
      console.error('[Auth] getCurrentUser exception:', err);
      console.error('[Auth] Error stack:', err.stack);
      return { user: null, error: err };
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
