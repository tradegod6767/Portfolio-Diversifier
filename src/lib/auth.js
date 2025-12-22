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
  if (error) throw error
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

export async function checkIfPro(user) {
  if (!user) return false

  try {
    // Check user metadata for Pro status (set by Gumroad webhook)
    const isPro = user.user_metadata?.is_pro === true

    console.log('[auth.js] checkIfPro:', {
      userId: user.id,
      email: user.email,
      isPro,
      metadata: user.user_metadata
    })

    return isPro
  } catch (err) {
    console.error('Error checking Pro status:', err)
    return false
  }
}
