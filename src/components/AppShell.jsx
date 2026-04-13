import { useState } from 'react'
import { BookOpen, LogOut } from 'lucide-react'
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
  isOwner
}) {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col pt-[52px] px-4 pb-6 font-sans">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 pl-2">
          <div
            className="w-8 h-8 bg-primary rounded-md flex items-center justify-center cursor-pointer transition-transform duration-300"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <BookOpen
              size={16}
              className="text-primary-foreground"
              style={{
                animation: isHovering ? 'flutter 0.6s ease-in-out infinite' : 'none',
              }}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">Hemingway</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Write with Purpose</p>
          </div>
        </div>
        <style>{`
          @keyframes flutter {
            0%, 100% { transform: rotateY(0deg) scale(1); }
            25% { transform: rotateY(-15deg) scale(1.05); }
            75% { transform: rotateY(15deg) scale(1.05); }
          }
        `}</style>

        {/* Board Switcher */}
        {boards && boards.length > 0 && (
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

        {/* Nav */}
        <nav className="flex-1">
          <button
            onClick={onNewIdea}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-md border border-border bg-transparent cursor-pointer text-xs font-medium text-foreground font-sans transition-all duration-[120ms] hover:bg-accent active:scale-95"
          >
            + New Idea
          </button>
        </nav>

        {/* User info & sign out */}
        <div className="pl-2 mb-3">
          <p className="text-[11px] text-muted-foreground">
            {user?.email}
          </p>
        </div>
        <button
          onClick={() => db.auth.signOut()}
          aria-label="Sign out"
          className="flex items-center gap-2 px-2.5 py-2 rounded-md border-none bg-transparent cursor-pointer text-xs text-muted-foreground font-sans w-full transition-all duration-[120ms] hover:bg-accent active:scale-95"
        >
          <LogOut size={14} />
          Sign out
        </button>

      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
