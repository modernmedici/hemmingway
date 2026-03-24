import { BookOpen, LayoutDashboard } from 'lucide-react';
import { FONTS } from '../lib/constants';

export default function AppShell({ children, onNewIdea, onToggleDark, isDark, linkedinSlot, coachSlot }) {
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
        padding: '24px 16px',
        fontFamily: FONTS.inter,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'hsl(var(--primary))',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={16} color="hsl(var(--primary-foreground))" />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))', lineHeight: 1 }}>Hemingway</p>
            <p style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>Write with Purpose</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px', borderRadius: 'var(--radius-md)',
            background: 'hsl(var(--sidebar-accent))',
            fontSize: '13px', fontWeight: 500, color: 'hsl(var(--foreground))',
            marginBottom: '4px',
          }}>
            <LayoutDashboard size={15} />
            Dashboard
          </div>

          <button
            onClick={onNewIdea}
            style={{
              width: '100%', marginTop: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '8px 10px', borderRadius: 'var(--radius-md)',
              border: '1px solid hsl(var(--border))',
              background: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: 500, color: 'hsl(var(--foreground))',
              fontFamily: FONTS.inter, transition: 'background 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--accent))'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          >
            + New Idea
          </button>

          {/* Coach nudge panel */}
          {coachSlot}

          {linkedinSlot && (
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid hsl(var(--sidebar-border))' }}>
              {linkedinSlot}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.05em' }}>
            Drafting Suite v1.0
          </p>
          <button
            onClick={onToggleDark}
            title="Toggle dark mode"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', fontSize: '14px', padding: '2px 4px' }}
          >
            {isDark ? '☀' : '☾'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
