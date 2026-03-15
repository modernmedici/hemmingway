import { FONTS, LINKEDIN } from '../lib/constants';
import LinkedInLogo from './LinkedInLogo';

export default function AccountsPanel({ linkedin }) {
  const { isConnected, profile, connect, disconnect } = linkedin;

  return (
    <div style={{ fontFamily: FONTS.inter }}>
      <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '10px' }}>
        Publishing
      </p>

      <div style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--sidebar-border))',
        borderRadius: 'var(--radius-md)',
        padding: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <LinkedInLogo />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'hsl(var(--foreground))', lineHeight: 1 }}>LinkedIn</p>
            <p style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isConnected ? (profile?.name ?? 'Connected') : 'Not connected'}
            </p>
          </div>
        </div>

        {isConnected ? (
          <button
            onClick={disconnect}
            style={{
              width: '100%', fontSize: '11px', fontFamily: FONTS.inter,
              color: 'hsl(var(--destructive))',
              background: 'none', border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius-sm)', padding: '4px 0',
              cursor: 'pointer', transition: 'background 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--muted))'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={connect}
            style={{
              width: '100%', fontSize: '11px', fontFamily: FONTS.inter, fontWeight: 500,
              color: '#fff', background: LINKEDIN.primary,
              border: 'none', borderRadius: 'var(--radius-sm)', padding: '5px 0',
              cursor: 'pointer', transition: 'background 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = LINKEDIN.hover; }}
            onMouseLeave={e => { e.currentTarget.style.background = LINKEDIN.primary; }}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
