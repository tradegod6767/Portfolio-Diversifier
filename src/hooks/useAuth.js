import { useState, useEffect } from 'react'
import { getCurrentUser, checkIfPro } from '../lib/auth'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        const currentUser = await getCurrentUser()

        if (!mounted) return

        setUser(currentUser)

        if (currentUser) {
          // Check Pro status AND subscription status
          const metadata = currentUser.user_metadata || {}
          const isPro = metadata.is_pro === true
          const subscriptionStatus = metadata.subscription_status
          const hasActiveSubscription = isPro && subscriptionStatus !== 'cancelled'

          console.log('[useAuth initAuth] Pro status check:', {
            isPro,
            subscriptionStatus,
            hasActiveSubscription,
            metadata: currentUser.user_metadata
          })

          if (mounted) {
            setIsPro(hasActiveSubscription)
          }
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] Auth state change:', event, 'Session:', session ? 'exists' : 'null')

        if (!mounted) return

        const newUser = session?.user ?? null
        console.log('[useAuth] Setting user to:', newUser ? newUser.email : 'null')
        setUser(newUser)

        if (newUser) {
          // Check Pro status AND subscription status
          const metadata = newUser.user_metadata || {}
          const isPro = metadata.is_pro === true
          const subscriptionStatus = metadata.subscription_status
          const hasActiveSubscription = isPro && subscriptionStatus !== 'cancelled'

          console.log('[useAuth] Pro status check:', {
            isPro,
            subscriptionStatus,
            hasActiveSubscription,
            metadata: newUser.user_metadata
          })

          if (mounted) {
            setIsPro(hasActiveSubscription)
          }
        } else {
          setIsPro(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function refetch() {
    if (user) {
      const proStatus = await checkIfPro(user.id)
      setIsPro(proStatus)
    }
  }

  return { user, isPro, loading, refetch }
}
