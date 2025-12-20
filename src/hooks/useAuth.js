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
          const proStatus = await checkIfPro(currentUser.id)
          if (mounted) {
            setIsPro(proStatus)
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
      async (_event, session) => {
        if (!mounted) return

        const newUser = session?.user ?? null
        setUser(newUser)

        if (newUser) {
          const proStatus = await checkIfPro(newUser.id)
          if (mounted) {
            setIsPro(proStatus)
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
