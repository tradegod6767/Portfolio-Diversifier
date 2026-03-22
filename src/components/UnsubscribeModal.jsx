import { useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { API_BASE_URL } from '../config'
import { LoadingSpinner } from './ui'

export default function UnsubscribeModal({ isOpen, onClose }) {
  const [downgrading, setDowngrading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleOpenGumroad = () => {
    window.open('https://app.gumroad.com/library', '_blank', 'noopener,noreferrer')
  }

  const handleDowngradeNow = async () => {
    setDowngrading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('You must be signed in to do this.')
        setDowngrading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to downgrade. Please try again.')
        setDowngrading(false)
        return
      }

      // Refresh session so auth state reflects the change
      await supabase.auth.refreshSession()
      setDowngrading(false)
      setSuccess(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setDowngrading(false)
    }
  }

  const handleClose = () => {
    if (downgrading) return
    setError('')
    setSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', animation: 'fadeIn 200ms ease' }}
    >
      <div
        className="relative w-full max-w-[440px] bg-card border border-border rounded-xl shadow-lg"
        style={{ animation: 'slideUp 250ms ease' }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={downgrading}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {success ? (
            <>
              {/* Success state */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">Downgraded to Free</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your account has been downgraded. Pro features are no longer active.
                  Remember to also cancel your billing on Gumroad to avoid future charges.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleOpenGumroad}
                  className="flex-1 h-11 bg-muted text-foreground border border-border rounded-md text-sm font-semibold transition-colors hover:bg-accent"
                >
                  Open Gumroad
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 h-11 bg-primary text-primary-foreground rounded-md text-sm font-semibold transition-opacity hover:opacity-90"
                >
                  Done
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Info icon */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                  </svg>
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">Cancel Subscription</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your Pro access will continue until the end of your current billing period.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  To cancel billing, you'll need to do so through Gumroad.
                  We'll open that page for you.
                </p>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 bg-loss-bg border border-loss/30 rounded-md">
                  <p className="text-sm text-loss font-medium">{error}</p>
                </div>
              )}

              {/* Primary action: go to Gumroad */}
              <button
                type="button"
                onClick={handleOpenGumroad}
                disabled={downgrading}
                className="w-full h-11 bg-primary text-primary-foreground rounded-md text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                Cancel Subscription on Gumroad
              </button>

              {/* Secondary action: immediate downgrade */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={downgrading}
                  className="flex-1 h-11 bg-muted text-foreground border border-border rounded-md text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keep Pro
                </button>
                <button
                  type="button"
                  onClick={handleDowngradeNow}
                  disabled={downgrading}
                  className="flex-1 h-11 text-loss border border-loss/30 bg-loss-bg rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downgrading ? (
                    <>
                      <LoadingSpinner size="sm" color="currentColor" />
                      Downgrading...
                    </>
                  ) : (
                    'Downgrade Now'
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                "Downgrade Now" removes Pro access immediately without waiting for your billing period to end.
              </p>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
