import { Users, Lock, Eye } from 'lucide-react'

// Get initials from email
function getInitials(email) {
  if (!email) return '?'
  const parts = email.split('@')[0].split('.')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return email.substring(0, 2).toUpperCase()
}

export default function EditorPresenceBar({ peers, currentUserId, editorPeer }) {
  // Handle null/undefined peers
  if (!peers) {
    console.log('EditorPresenceBar: No peers data')
    return (
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border py-2 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-muted-foreground" />
            <span className="text-xs font-sans text-muted-foreground">
              Collaborative mode ready
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Filter out current user
  const otherPeers = Object.entries(peers)
    .filter(([peerId]) => peerId !== currentUserId)
    .map(([peerId, peerData]) => ({
      id: peerId,
      ...peerData,
    }))

  const viewers = otherPeers.filter(p => p.id !== editorPeer?.id)

  // Show even when alone to indicate collaborative mode is active
  const hasOthers = otherPeers.length > 0

  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border py-2 px-6">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Editor info or solo indicator */}
        {editorPeer ? (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-sans font-bold text-white"
              style={{ backgroundColor: editorPeer.color || 'hsl(var(--primary))' }}
            >
              {getInitials(editorPeer.email)}
            </div>
            <div className="flex items-center gap-1.5">
              <Lock size={12} className="text-primary" />
              <span className="text-xs font-sans text-foreground">
                <span className="font-medium">{editorPeer.name || editorPeer.email}</span> is editing
              </span>
            </div>
          </div>
        ) : !hasOthers ? (
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-muted-foreground" />
            <span className="text-xs font-sans text-muted-foreground">
              Collaborative mode ready
            </span>
          </div>
        ) : null}

        {/* Viewers */}
        {hasOthers && viewers.length > 0 && (
          <div className="flex items-center gap-2">
            <Eye size={12} className="text-muted-foreground" />
            <span className="text-xs font-sans text-muted-foreground">
              {viewers.length} {viewers.length === 1 ? 'viewer' : 'viewers'}
            </span>
            <div className="flex -space-x-1.5">
              {viewers.slice(0, 3).map((viewer) => (
                <div
                  key={viewer.id}
                  className="w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-[8px] font-sans font-bold text-white"
                  style={{ backgroundColor: viewer.color || 'hsl(var(--muted))' }}
                  title={viewer.name || viewer.email}
                >
                  {getInitials(viewer.email)}
                </div>
              ))}
              {viewers.length > 3 && (
                <div className="w-5 h-5 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-sans font-bold text-muted-foreground">
                  +{viewers.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
