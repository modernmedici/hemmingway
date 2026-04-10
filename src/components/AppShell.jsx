import { useState } from 'react'
import { BookOpen, LogOut } from 'lucide-react'
import { FONTS } from '../lib/constants'
import db from '../lib/db'

export default function AppShell({ children, onNewIdea, user }) {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(var(--background))' }}>
      {/* Sidebar */}
      <aside style={{
        width: '256px',
        flexShrink: 0,
        background: 'hsl(var(--sidebar))',
        borderRight: '1px solid hsl(var(--sidebar-border))',
        display: 'flex',
        flexDirection: 'column',
        padding: '52px 16px 24px',
        fontFamily: FONTS.inter,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
          <div
            style={{
              width: '32px', height: '32px',
              background: 'hsl(var(--primary))',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <BookOpen
              size={16}
              color="hsl(var(--primary-foreground))"
              style={{
                animation: isHovering ? 'flutter 0.6s ease-in-out infinite' : 'none',
              }}
            />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))', lineHeight: 1 }}>Hemingway</p>
            <p style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>Write with Purpose</p>
          </div>
        </div>
        <style>{`
          @keyframes flutter {
            0%, 100% { transform: rotateY(0deg) scale(1); }
            25% { transform: rotateY(-15deg) scale(1.05); }
            75% { transform: rotateY(15deg) scale(1.05); }
          }
        `}</style>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          <button
            onClick={onNewIdea}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '8px 10px', borderRadius: 'var(--radius-md)',
              border: '1px solid hsl(var(--border))',
              background: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: 500, color: 'hsl(var(--foreground))',
              fontFamily: FONTS.inter, transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--accent))'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            + New Idea
          </button>
        </nav>

        {/* User info & sign out */}
        <div style={{ paddingLeft: '8px', marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
            {user?.email}
          </p>
        </div>
        <button
          onClick={() => db.auth.signOut()}
          aria-label="Sign out"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px', borderRadius: 'var(--radius-md)',
            border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '12px', color: 'hsl(var(--muted-foreground))',
            fontFamily: FONTS.inter, width: '100%', transition: 'all 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--accent))'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <LogOut size={14} />
          Sign out
        </button>

      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
