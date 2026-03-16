import { useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { API_BASE_URL } from '../config'
import { LoadingSpinner } from './ui'

export default function DeleteAccountModal({ isOpen, onClose }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setDeleting(true)
    setError('')

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()

      if (!currentUser || !session?.access_token) {
        setError('You must be signed in to delete your account.')
        setDeleting(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to delete account. Please try again.')
        setDeleting(false)
        return
      }

      // Account deleted — sign out locally and redirect
      await supabase.auth.signOut()
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = '/'
    } catch {
      setError('An unexpected error occurred. Please try again.')
      setDeleting(false)
    }
  }

  const handleClose = () => {
    if (deleting) return
    setError('')
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
          disabled={deleting}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Warning icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-loss-bg flex items-center justify-center">
              <svg className="w-6 h-6 text-loss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">Delete Account</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This will permanently delete your account and all your saved portfolios.
              <span className="font-semibold text-foreground"> This cannot be undone.</span>
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-loss-bg border border-loss/30 rounded-md">
              <p className="text-sm text-loss font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={deleting}
              className="flex-1 h-11 bg-muted text-foreground border border-border rounded-md text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 h-11 bg-loss text-white rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  Deleting...
                </>
              ) : (
                'Delete My Account'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
