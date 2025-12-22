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
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      // User not logged in - silently return false without logging
      return false
    }

    const isPro = user.user_metadata?.is_pro === true
    console.log('Checking Pro status:', { email: user.email, isPro, metadata: user.user_metadata })

    return isPro
  } catch (error) {
    console.error('Error checking pro status:', error)
    return false
  }
}
