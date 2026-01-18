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
          const metadata = currentUser.user_metadata || {}
          const isProUser = metadata.is_pro === true
          const subscriptionStatus = metadata.subscription_status
          const hasActiveSubscription = isProUser && subscriptionStatus !== 'cancelled'

          if (mounted) {
            setIsPro(hasActiveSubscription)
          }
        }
      } catch {
        // Auth initialization failed silently
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        const newUser = session?.user ?? null
        setUser(newUser)

        if (newUser) {
          const metadata = newUser.user_metadata || {}
          const isProUser = metadata.is_pro === true
          const subscriptionStatus = metadata.subscription_status
          const hasActiveSubscription = isProUser && subscriptionStatus !== 'cancelled'

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
