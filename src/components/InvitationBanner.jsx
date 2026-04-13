import { useState } from 'react'
import { Mail, Check, X, Loader2 } from 'lucide-react'

export default function InvitationBanner({ invitations, onAccept, onDecline }) {
  const [processingId, setProcessingId] = useState(null)
  const [error, setError] = useState(null)

  if (!invitations || invitations.length === 0) return null

  const handleAccept = async (invitation) => {
    setProcessingId(invitation.id)
    setError(null)
    try {
      await onAccept(invitation.id, invitation.boardId)
      // Success - banner will disappear as invitation updates to 'accepted'
    } catch (err) {
      console.error('Failed to accept invitation:', err)
      setError(err.message || 'Failed to accept invitation. Check console for details.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (invitation) => {
    setProcessingId(invitation.id)
    try {
      await onDecline(invitation.id)
    } catch (err) {
      console.error('Failed to decline invitation:', err)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="bg-accent/30 border-b border-border/10">
      <div className="max-w-5xl mx-auto px-6 py-3">
        <div className="flex items-start gap-3">
          <Mail size={18} className="text-foreground/40 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium font-sans text-foreground/80 mb-2">
              You have {invitations.length} pending{' '}
              {invitations.length === 1 ? 'invitation' : 'invitations'}
            </p>
            <div className="space-y-2">
              {invitations.map((invitation) => {
                const isProcessing = processingId === invitation.id
                const inviterName = invitation.inviterName || 'Someone'
                const boardName = invitation.boardName || 'a board'

                return (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between gap-4 bg-card/60 rounded-md px-3 py-2 border border-border/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans text-foreground/80">
                        <span className="font-medium">{inviterName}</span> invited
                        you to collaborate on{' '}
                        <span className="font-medium">"{boardName}"</span>
                      </p>
                      <p className="text-xs text-muted-foreground/70 font-sans mt-0.5">
                        Role: {invitation.role === 'editor' ? 'Editor' : 'Viewer'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAccept(invitation)}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium rounded-md border-none transition-opacity duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: 'hsl(var(--primary))',
                          color: 'hsl(var(--primary-foreground))',
                        }}
                      >
                        {isProcessing ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(invitation)}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium rounded-md bg-transparent border border-border/30 text-muted-foreground/70 transition-colors duration-100 hover:bg-secondary hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={12} />
                        Decline
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {error && (
              <div className="mt-3 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive font-sans">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
