import { useState } from 'react'
import { X, Loader2, Check } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ShareBoardModal({ board, onClose, onInvite }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('editor')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setSending(true)
    setError(null)
    setSuccess(false)

    try {
      await onInvite(board.id, email.trim(), role)
      setSuccess(true)
      setEmail('')

      // Auto-close after success
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to send invitation')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 animate-[fadeIn_0.15s_ease]"
        style={{
          background: 'hsl(var(--foreground) / 0.15)',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-background border border-border/20 rounded-lg w-full max-w-md pointer-events-auto"
          style={{
            animation: 'viewFadeIn 0.2s ease forwards',
            boxShadow: '0 4px 16px hsl(var(--foreground) / 0.08)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-sans text-foreground/70 mb-0.5">Share</p>
              <h2 className="text-xl font-serif font-bold text-foreground">"{board.name}"</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded bg-transparent border-none cursor-pointer text-muted-foreground/60 transition-colors duration-100 hover:text-foreground hover:bg-secondary"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="px-6 py-5">
            {/* Email input */}
            <div className="mb-4">
              <label
                htmlFor="invite-email"
                className="block text-sm font-sans text-foreground/80 mb-2"
              >
                Email address
              </label>
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                autoFocus
                disabled={sending}
                className="w-full px-4 py-3 text-sm font-sans bg-card rounded-md text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)',
                }}
              />
            </div>

            {/* Role selector */}
            <div className="mb-5">
              <label className="block text-sm font-sans text-foreground/80 mb-3">
                Role
              </label>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setRole('editor')}
                  disabled={sending}
                  className="w-full px-4 py-3 text-left rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_2px_6px_hsl(var(--foreground)/0.05)]"
                  style={{
                    background: 'hsl(var(--card))',
                    border: role === 'editor'
                      ? '2px solid hsl(var(--primary))'
                      : '1px solid hsl(var(--border) / 0.3)',
                    boxShadow: role === 'editor'
                      ? '0 2px 8px hsl(var(--foreground) / 0.06)'
                      : '0 1px 3px hsl(var(--foreground) / 0.04)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-sans font-medium text-foreground">
                      Editor
                    </span>
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: role === 'editor' ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                      }}
                    >
                      {role === 'editor' && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: 'hsl(var(--primary))' }}
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-sans leading-relaxed text-muted-foreground">
                    Can view, create, and edit posts on this board
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('viewer')}
                  disabled={sending}
                  className="w-full px-4 py-3 text-left rounded-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_2px_6px_hsl(var(--foreground)/0.05)]"
                  style={{
                    background: 'hsl(var(--card))',
                    border: role === 'viewer'
                      ? '2px solid hsl(var(--primary))'
                      : '1px solid hsl(var(--border) / 0.3)',
                    boxShadow: role === 'viewer'
                      ? '0 2px 8px hsl(var(--foreground) / 0.06)'
                      : '0 1px 3px hsl(var(--foreground) / 0.04)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-sans font-medium text-foreground">
                      Viewer
                    </span>
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: role === 'viewer' ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                      }}
                    >
                      {role === 'viewer' && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: 'hsl(var(--primary))' }}
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-sans leading-relaxed text-muted-foreground">
                    Can only view posts (read-only)
                  </p>
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/10">
                <p className="text-sm text-destructive/90 font-sans">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="mb-4 px-3 py-2 rounded-md bg-primary/10 flex items-center gap-2"
              >
                <Check size={16} className="text-primary flex-shrink-0" />
                <p className="text-sm text-primary/90 font-sans">Invitation sent!</p>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="flex-1 px-4 py-2.5 text-sm font-sans font-medium rounded-md bg-transparent text-foreground/70 transition-colors duration-100 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!email.trim() || sending}
                className="flex-1 px-4 py-2.5 text-sm font-sans font-medium rounded-md bg-primary text-primary-foreground transition-opacity duration-100 hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                style={{
                  boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)',
                }}
              >
                {sending && <Loader2 size={14} className="animate-spin" />}
                {sending ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
