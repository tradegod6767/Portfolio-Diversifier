import { supabase } from './supabase'

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data.user
}

export async function signup(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    // Check if it's a "user already exists" error
    if (error.message?.includes('already registered') ||
        error.message?.includes('already exists') ||
        error.status === 422) {
      throw new Error('An account with this email already exists. Please sign in instead.')
    }
    throw error
  }

  // Supabase returns a user even if email is already registered (for security)
  // Check if this is a new signup or existing user
  if (data.user && !data.user.confirmed_at && data.user.identities?.length === 0) {
    throw new Error('An account with this email already exists. Please sign in instead.')
  }

  // Send welcome email asynchronously (don't block signup on email send)
  if (data.user) {
    const userName = email.split('@')[0]
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'welcome',
        email: email,
        userName: userName
      })
    }).catch(err => {
      // Log but don't fail signup if email fails
      console.error('[Signup] Failed to send welcome email:', err)
    })
  }

  return data.user
}

export async function logout() {
  console.log('[auth.js] Logging out...')
  console.log('[auth.js] Supabase client exists?', !!supabase)

  try {
    const { error } = await supabase.auth.signOut()
    console.log('[auth.js] Supabase signOut result:', { error })

    if (error) {
      console.error('[auth.js] SignOut error:', error)
      throw error
    }

    console.log('[auth.js] Logout complete - no errors')
  } catch (err) {
    console.error('[auth.js] Logout exception:', err)
    throw err
  }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function checkIfPro(userId) {
  console.log('[checkIfPro] Starting check for userId:', userId)

  try {
    console.log('[checkIfPro] Calling supabase.auth.getUser()...')
    const { data: { user }, error } = await supabase.auth.getUser()
    console.log('[checkIfPro] getUser returned:', { user: user ? 'exists' : 'null', error })

    if (error || !user) {
      console.log('[checkIfPro] No user or error, returning false')
      return false
    }

    const metadata = user.user_metadata || {}
    const isPro = metadata.is_pro === true
    const subscriptionStatus = metadata.subscription_status

    // User must have is_pro = true AND subscription_status must not be 'cancelled'
    const hasActiveSubscription = isPro && subscriptionStatus !== 'cancelled'

    console.log('[checkIfPro] Checking Pro status:', {
      email: user.email,
      isPro,
      subscriptionStatus,
      hasActiveSubscription,
      metadata: user.user_metadata
    })

    return hasActiveSubscription
  } catch (error) {
    console.error('[checkIfPro] Error checking pro status:', error)
    return false
  }
}

export async function resetPasswordForEmail(email) {
  const redirectTo = `${window.location.origin}/reset-password`

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })

  if (error) throw error
  return data
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw error
  return data
}
