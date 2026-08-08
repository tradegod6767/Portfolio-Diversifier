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

    if (!response.ok) {
      // A pre-signup purchase that fails to activate means a paying user
      // silently never gets Pro (this was F1). Do NOT swallow it. The server
      // records the detail in webhook_logs; surface it on the client too so the
      // failure is not invisible here.
      let detail = '';
      try {
        detail = JSON.stringify(await response.json());
      } catch {
        detail = await response.text().catch(() => '');
      }
      console.error(
        `[Auth] Pending-purchase claim FAILED (HTTP ${response.status}) for ${email}: ${detail}`
      );
      return false;
    }

    const result = await response.json();
    if (result.found && result.claimed) {
      console.log('[Auth] Claimed pending Pro purchase!');
      return true;
    }
    return false;
  } catch (error) {
    // Network/parse failure — still don't block auth, but make it visible
    // instead of swallowing it.
    console.error('[Auth] Error claiming pending purchase:', error);
    return false;
  }
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

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('is_pro, subscription_status')
    .eq('user_id', userId)
    .maybeSingle();

  // DIAGNOSTIC — remove once Pro status is confirmed working
  console.log('[checkIfPro] userId:', userId, '| data:', data, '| error:', error);

  if (error) {
    console.error('[checkIfPro] DB error:', error);
    return { isPro: false, subscriptionStatus: 'free' };
  }

  return {
    isPro: data?.is_pro === true,
    subscriptionStatus: data?.subscription_status || 'free',
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
