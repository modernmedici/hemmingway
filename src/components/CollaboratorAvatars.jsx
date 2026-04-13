import { useEffect } from 'react'
import db from '../lib/db'

// Color palette for user avatars
const COLORS = [
  'hsl(210, 100%, 56%)', // Blue
  'hsl(340, 82%, 52%)',  // Pink
  'hsl(291, 64%, 42%)',  // Purple
  'hsl(171, 100%, 41%)', // Teal
  'hsl(48, 100%, 67%)',  // Yellow
  'hsl(25, 95%, 53%)',   // Orange
  'hsl(141, 71%, 48%)',  // Green
  'hsl(0, 84%, 60%)',    // Red
]

// Deterministic color from user ID
function getUserColor(userId) {
  if (!userId) return COLORS[0]
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return COLORS[hash % COLORS.length]
}

// Get initials from email
function getInitials(email) {
  if (!email) return '?'
  const parts = email.split('@')[0].split('.')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return email.substring(0, 2).toUpperCase()
}

export default function CollaboratorAvatars({ boardId, currentUser }) {
  // Room must be created unconditionally for React hooks
  const room = db.room('board', boardId || 'no-board')
  const presence = room.usePresence()

  useEffect(() => {
    if (!presence || !currentUser || !boardId) return

    const color = getUserColor(currentUser.id)

    // Publish presence when component mounts
    presence.publishPresence({
      name: currentUser.email?.split('@')[0] || 'Anonymous',
      email: currentUser.email,
      color,
    })

    // Update presence every 30 seconds to keep connection alive
    const interval = setInterval(() => {
      presence.publishPresence({
        name: currentUser.email?.split('@')[0] || 'Anonymous',
        email: currentUser.email,
        color,
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [presence, currentUser, boardId])

  if (!presence || !presence.peers) return null

  // Filter out current user and get unique peers
  const otherPeers = Object.entries(presence.peers || {})
    .filter(([peerId]) => peerId !== presence.user?.id)
    .map(([peerId, peerData]) => ({
      id: peerId,
      ...peerData,
    }))

  if (otherPeers.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {otherPeers.slice(0, 5).map((peer) => {
          const initials = getInitials(peer.email)
          const color = peer.color || getUserColor(peer.id)

          return (
            <div
              key={peer.id}
              className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-sans font-bold text-white shadow-sm"
              style={{ backgroundColor: color }}
              title={peer.name || peer.email}
            >
              {initials}
            </div>
          )
        })}
      </div>

      {otherPeers.length > 0 && (
        <span className="text-xs font-sans text-muted-foreground">
          {otherPeers.length === 1
            ? `${otherPeers[0].name || otherPeers[0].email} is here`
            : `${otherPeers.length} people here`}
        </span>
      )}
    </div>
  )
}
