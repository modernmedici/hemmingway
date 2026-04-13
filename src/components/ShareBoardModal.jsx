import { useState } from 'react'
import { X, Mail, Loader2 } from 'lucide-react'

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
        className="fixed inset-0 bg-black/40 z-50 animate-[fadeIn_0.15s_ease]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-card border border-border/20 rounded-lg shadow-xl w-full max-w-md pointer-events-auto"
          style={{
            animation: 'viewFadeIn 0.2s ease forwards',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/15">
            <h2 className="text-lg font-semibold font-sans text-foreground">
              Share "{board.name}"
            </h2>
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
                className="block text-sm font-medium font-sans text-foreground mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                />
                <input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  autoFocus
                  disabled={sending}
                  className="w-full pl-10 pr-4 py-2.5 text-sm font-sans bg-background border border-border/30 rounded-md text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Role selector */}
            <div className="mb-5">
              <label className="block text-sm font-medium font-sans text-foreground mb-2">
                Role
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole('editor')}
                  disabled={sending}
                  className="flex-1 px-4 py-2 text-sm font-sans font-medium rounded-md border transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: role === 'editor' ? 'hsl(var(--primary))' : 'transparent',
                    color: role === 'editor' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground) / 0.7)',
                    borderColor: role === 'editor' ? 'hsl(var(--primary))' : 'hsl(var(--border) / 0.3)',
                  }}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setRole('viewer')}
                  disabled={sending}
                  className="flex-1 px-4 py-2 text-sm font-sans font-medium rounded-md border transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: role === 'viewer' ? 'hsl(var(--primary))' : 'transparent',
                    color: role === 'viewer' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground) / 0.7)',
                    borderColor: role === 'viewer' ? 'hsl(var(--primary))' : 'hsl(var(--border) / 0.3)',
                  }}
                >
                  Viewer
                </button>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-2 font-sans">
                {role === 'editor'
                  ? 'Can view, create, and edit posts on this board'
                  : 'Can only view posts (read-only)'}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/10">
                <p className="text-sm text-destructive/90 font-sans">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mb-4 px-3 py-2 rounded-md bg-primary/10 border border-primary/10">
                <p className="text-sm text-primary/90 font-sans">Invitation sent!</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="flex-1 px-4 py-2.5 text-sm font-sans font-medium rounded-md border border-border/30 bg-transparent text-foreground/70 transition-colors duration-100 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!email.trim() || sending}
                className="flex-1 px-4 py-2.5 text-sm font-sans font-medium rounded-md border-none transition-opacity duration-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
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
