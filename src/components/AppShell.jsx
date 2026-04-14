import { useState } from 'react'
import { BookOpen, LogOut, Mail, Check, X, Loader2 } from 'lucide-react'
import db from '../lib/db'
import BoardSwitcher from './BoardSwitcher'

export default function AppShell({
  children,
  onNewIdea,
  user,
  boards,
  activeBoardId,
  onSelectBoard,
  onCreateBoard,
  isOwner,
  pendingInvitations = [],
  onAcceptInvitation,
  onDeclineInvitation
}) {
  const [isHovering, setIsHovering] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [processingInviteId, setProcessingInviteId] = useState(null)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className="flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col pt-[52px] pb-6 font-sans transition-all duration-300 ease-out"
        style={{ width: sidebarExpanded ? '256px' : '64px', paddingLeft: sidebarExpanded ? '16px' : '12px', paddingRight: sidebarExpanded ? '16px' : '12px' }}
      >
        {/* Logo */}
        <div className={`flex items-center mb-8 transition-all duration-300 ${sidebarExpanded ? 'gap-2.5 pl-2' : 'justify-center'}`}>
          <div
            className="w-8 h-8 bg-primary rounded-md flex items-center justify-center cursor-pointer flex-shrink-0"
          >
            <BookOpen size={16} className="text-primary-foreground" />
          </div>
          {sidebarExpanded && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-foreground leading-none whitespace-nowrap">Hemingway</p>
            </div>
          )}
        </div>

        {/* Board Switcher - only show when expanded */}
        {boards && boards.length > 0 && sidebarExpanded && (
          <div className="mb-4">
            <BoardSwitcher
              boards={boards}
              activeBoardId={activeBoardId}
              onSelectBoard={onSelectBoard}
              onCreateBoard={onCreateBoard}
              isOwner={isOwner}
            />
          </div>
        )}

        {/* Invitation Badge - collapsed state */}
        {!sidebarExpanded && pendingInvitations.length > 0 && (
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{pendingInvitations.length}</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
            </div>
          </div>
        )}

        {/* Invitation List - expanded state */}
        {sidebarExpanded && pendingInvitations.length > 0 && (
          <div className="mb-4 px-2">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={12} className="text-muted-foreground" />
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Invitations ({pendingInvitations.length})
              </p>
            </div>
            <div className="space-y-2">
              {pendingInvitations.map((invite) => {
                const isProcessing = processingInviteId === invite.id
                return (
                  <div
                    key={invite.id}
                    className="bg-card/40 rounded border border-border/20 p-2"
                  >
                    <p className="text-xs text-foreground/80 mb-1 font-medium truncate">
                      {invite.boardName || 'Untitled'}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mb-2 truncate">
                      from {invite.inviterName || 'Someone'}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={async () => {
                          setProcessingInviteId(invite.id)
                          try {
                            await onAcceptInvitation(invite.id, invite.boardId)
                          } finally {
                            setProcessingInviteId(null)
                          }
                        }}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[10px] font-medium rounded bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <Check size={10} />
                        )}
                      </button>
                      <button
                        onClick={async () => {
                          setProcessingInviteId(invite.id)
                          try {
                            await onDeclineInvitation(invite.id)
                          } finally {
                            setProcessingInviteId(null)
                          }
                        }}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center px-2 py-1 text-[10px] rounded border border-border/30 bg-transparent text-muted-foreground/70 transition-colors hover:bg-secondary disabled:opacity-50"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1">
          <button
            onClick={onNewIdea}
            className={`w-full flex items-center rounded-md bg-card cursor-pointer text-xs font-medium text-foreground transition-all duration-150 hover:shadow-[0_2px_6px_hsl(var(--foreground)/0.05)] active:scale-[0.98] ${sidebarExpanded ? 'justify-center gap-1.5 px-2.5 py-2' : 'justify-center py-2'}`}
            style={{
              boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)',
            }}
            title={sidebarExpanded ? '' : 'New Idea'}
          >
            {sidebarExpanded ? (
              <>
                <span className="font-sans">+</span>
                <span className="font-serif">New Idea</span>
              </>
            ) : (
              '+'
            )}
          </button>
        </nav>

        {/* User info & sign out */}
        {sidebarExpanded && (
          <div className="pl-2 mb-3">
            <p className="text-[11px] text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        )}
        <button
          onClick={() => db.auth.signOut()}
          aria-label="Sign out"
          className={`flex items-center rounded-md border-none bg-transparent cursor-pointer text-xs text-muted-foreground font-sans w-full transition-all duration-[120ms] hover:bg-accent active:scale-95 ${sidebarExpanded ? 'gap-2 px-2.5 py-2' : 'justify-center py-2'}`}
          title={sidebarExpanded ? '' : 'Sign out'}
        >
          <LogOut size={14} />
          {sidebarExpanded && 'Sign out'}
        </button>

      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
