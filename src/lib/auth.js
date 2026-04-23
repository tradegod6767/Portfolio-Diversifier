import { supabase } from './supabase';

// Check and claim any pending purchases for this email
async function claimPendingPurchase(email, userId) {
  try {
    // Get the current session token for authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const headers = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch('/api/claim-pending-purchase', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, userId }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.found && result.claimed) {
        console.log('[Auth] Claimed pending Pro purchase!');
        return true;
      }
    }
  } catch (error) {
    // Don't block auth on claim errors
    console.error('[Auth] Error claiming pending purchase:', error);
  }
  return false;
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  // Check for pending purchases after login
  if (data.user) {
    claimPendingPurchase(email, data.user.id).catch(() => {});
  }

  return data.user;
}

export async function signup(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    // Check if it's a "user already exists" error
    if (
      error.message?.includes('already registered') ||
      error.message?.includes('already exists') ||
      error.status === 422
    ) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }
    throw error;
  }

  // Supabase returns a user even if email is already registered (for security)
  // Check if this is a new signup or existing user
  if (data.user && !data.user.confirmed_at && data.user.identities?.length === 0) {
    throw new Error('An account with this email already exists. Please sign in instead.');
  }

  // Send welcome email and check for pending purchases asynchronously
  if (data.user) {
    const userName = email.split('@')[0];

    // Send welcome email (include auth token if available)
    (async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        const headers = { 'Content-Type': 'application/json' };
        if (currentSession?.access_token) {
          headers.Authorization = `Bearer ${currentSession.access_token}`;
        }
        await fetch('/api/send-email', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: 'welcome',
            email: email,
            userName: userName,
          }),
        });
      } catch {
        // Silently fail - don't block signup if welcome email fails
      }
    })();

    // Check for pending Pro purchases (from pre-signup Gumroad purchases)
    claimPendingPurchase(email, data.user.id).catch(() => {});
  }

  return data.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function checkIfPro(userId) {
  if (!userId) return { isPro: false, subscriptionStatus: 'free' };

  // Primary source of truth: user_subscriptions table (written by webhook)
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('is_pro, subscription_status')
    .eq('user_id', userId)
    .maybeSingle();

  console.log('[checkIfPro] userId:', userId, '| data:', data, '| error:', error);

  if (!error && data) {
    console.log('[checkIfPro] result from user_subscriptions → isPro:', data.is_pro);
    return {
      isPro: data.is_pro === true,
      subscriptionStatus: data.subscription_status || 'free',
    };
  }

  // Fallback: user_metadata (may be stale, but better than nothing)
  console.log('[checkIfPro] falling back to user_metadata (no row or error above)');
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isPro: false, subscriptionStatus: 'free' };

  console.log('[checkIfPro] user_metadata.is_pro:', user.user_metadata?.is_pro);
  return {
    isPro: user.user_metadata?.is_pro === true,
    subscriptionStatus: user.user_metadata?.subscription_status || 'free',
  };
}

export async function resetPasswordForEmail(email) {
  const redirectTo = `${window.location.origin}/reset-password`;

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) throw error;
  return data;
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return data;
}
