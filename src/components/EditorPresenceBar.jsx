// Get initials from email
function getInitials(email) {
  if (!email) return '?'
  const parts = email.split('@')[0].split('.')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return email.substring(0, 2).toUpperCase()
}

// Minimal inline presence indicator - shows avatars of other people in the session
export default function EditorPresenceBar({ peers, currentUserId }) {
  // Handle null/undefined peers
  if (!peers) return null

  // Filter out current user
  const otherPeers = Object.entries(peers)
    .filter(([peerId]) => peerId !== currentUserId)
    .map(([peerId, peerData]) => ({
      id: peerId,
      ...peerData,
    }))

  // Don't show anything if alone
  if (otherPeers.length === 0) return null

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex -space-x-1.5">
        {otherPeers.slice(0, 3).map((peer) => (
          <div
            key={peer.id}
            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-sans font-bold text-white shadow-sm border border-background"
            style={{ backgroundColor: peer.color || 'hsl(var(--primary))' }}
            title={peer.name || peer.email}
          >
            {getInitials(peer.email)}
          </div>
        ))}
        {otherPeers.length > 3 && (
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-sans font-bold text-primary border border-background">
            +{otherPeers.length - 3}
          </div>
        )}
      </div>
      <span className="text-[11px] font-sans text-muted-foreground">
        {otherPeers.length === 1 ? '1 other' : `${otherPeers.length} others`}
      </span>
    </div>
  )
}
