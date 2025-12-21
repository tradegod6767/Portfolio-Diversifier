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

export async function checkIfPro(userId) {
  if (!userId) return false

  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('subscription_status, current_period_end')
      .eq('id', userId)
      .maybeSingle()

    if (error || !data) return false

    if (data.subscription_status !== 'active') return false

    if (data.current_period_end) {
      return new Date(data.current_period_end) > new Date()
    }

    return true
  } catch (err) {
    console.error('Error checking Pro status:', err)
    return false
  }
}
