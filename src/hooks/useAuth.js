import { useState, useEffect, useRef } from 'react'
import { getCurrentUser, checkIfPro } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { useProPolling } from './useProPolling'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)
  const [proJustActivated, setProJustActivated] = useState(false)
  // Tracks the last known isPro value so we can detect false → true transitions
  const prevIsProRef = useRef(false)
  // Tracks the background Pro polling interval so we can cancel it
  const proPollingRef = useRef(null)

  useEffect(() => {
    let mounted = true

    // Poll the user_subscriptions table every 5s for up to 60s to detect Pro upgrades.
    // Guards against double-start — only one polling loop runs at a time.
    function startProPolling(userId) {
      if (proPollingRef.current) return

      let attempts = 0
      const maxAttempts = 12 // 12 × 5s = 60s

      proPollingRef.current = setInterval(async () => {
        if (!mounted) {
          clearInterval(proPollingRef.current)
          proPollingRef.current = null
          return
        }

        attempts++
        console.log('[Pro Poll] checking... isPro: false')

        if (attempts > maxAttempts) {
          clearInterval(proPollingRef.current)
          proPollingRef.current = null
          return
        }

        try {
          const { isPro: hasActiveSub } = await checkIfPro(userId)

          if (!mounted) {
            clearInterval(proPollingRef.current)
            proPollingRef.current = null
            return
          }

          if (hasActiveSub) {
            console.log('[Pro Poll] detected Pro upgrade!')
            clearInterval(proPollingRef.current)
            proPollingRef.current = null
            setIsPro(true)
            setProJustActivated(true)
            prevIsProRef.current = true
          }
        } catch {
          // Silently ignore polling errors
        }
      }, 5000)
    }

    async function initAuth() {
      try {
        const currentUser = await getCurrentUser()

        if (!mounted) return

        setUser(currentUser)

        if (currentUser) {
          // DEV ONLY: localStorage override for testing Pro features without a real subscription.
          // Open the browser console and run: localStorage.setItem('dev_force_pro', 'true')
          // Then refresh. Remove with: localStorage.removeItem('dev_force_pro')
          const devForcePro = import.meta.env.DEV &&
            localStorage.getItem('dev_force_pro') === 'true'

          const currentIsPro = currentUser.user_metadata?.is_pro === true || devForcePro

          if (mounted) {
            setIsPro(currentIsPro)
            prevIsProRef.current = currentIsPro
            if (!currentIsPro) {
              startProPolling(currentUser.id)
            }
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
      (event, session) => {
        if (!mounted) return

        const newUser = session?.user ?? null
        setUser(newUser)

        if (newUser) {
          const devForcePro = import.meta.env.DEV &&
            localStorage.getItem('dev_force_pro') === 'true'

          const newIsPro = newUser.user_metadata?.is_pro === true || devForcePro

          if (mounted) {
            setIsPro(newIsPro)

            // Detect Pro activation on an active session:
            // - TOKEN_REFRESHED: webhook updated subscription, polling detected it
            // - SIGNED_IN: user just logged in with is_pro already true (fresh purchase)
            // Skip INITIAL_SESSION to avoid false positives on page load for existing Pro users
            if (
              (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') &&
              !prevIsProRef.current &&
              newIsPro
            ) {
              setProJustActivated(true)
            }

            prevIsProRef.current = newIsPro

            // Start background polling on any tab where user is logged in but not yet Pro
            if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && !newIsPro) {
              startProPolling(newUser.id)
            }

            // Stop polling as soon as Pro is confirmed
            if (newIsPro && proPollingRef.current) {
              clearInterval(proPollingRef.current)
              proPollingRef.current = null
            }
          }
        } else {
          setIsPro(false)
          prevIsProRef.current = false
          if (proPollingRef.current) {
            clearInterval(proPollingRef.current)
            proPollingRef.current = null
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
      if (proPollingRef.current) {
        clearInterval(proPollingRef.current)
        proPollingRef.current = null
      }
    }
  }, [])

  async function refetch() {
    if (user) {
      const { isPro: proStatus } = await checkIfPro(user.id)
      setIsPro(proStatus)
    }
  }

  function clearProActivated() {
    setProJustActivated(false)
  }

  // Wire up polling only when user just returned from Gumroad checkout (?upgraded=true)
  useProPolling(user?.id, () => {
    // Refresh pro status when polling detects activation
    if (user?.id) {
      checkIfPro(user.id).then(({ isPro: activatedPro }) => {
        setIsPro(activatedPro)
        if (activatedPro) {
          setProJustActivated(true)
          prevIsProRef.current = true
        }
      })
    }
  })

  return { user, isPro, loading, refetch, proJustActivated, clearProActivated }
}
