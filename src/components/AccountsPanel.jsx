const inter = "'Inter', sans-serif";
const serif = "'Libre Baskerville', Georgia, serif";

export default function AccountsPanel({ linkedin }) {
  const { isConnected, profile, connect, disconnect } = linkedin;

  return (
    <div style={{ fontFamily: inter }}>
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
          <div style={{
            width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
            background: '#0077B5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontFamily: serif, fontWeight: 700, fontSize: '13px', color: '#fff' }}>in</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'hsl(var(--foreground))', lineHeight: 1 }}>LinkedIn</p>
            <p style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isConnected ? `${profile?.name ?? 'Connected'}` : 'Not connected'}
            </p>
          </div>
        </div>

        {isConnected ? (
          <button
            onClick={disconnect}
            style={{
              width: '100%', fontSize: '11px', fontFamily: inter,
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
              width: '100%', fontSize: '11px', fontFamily: inter, fontWeight: 500,
              color: '#fff', background: '#0077B5',
              border: 'none', borderRadius: 'var(--radius-sm)', padding: '5px 0',
              cursor: 'pointer', transition: 'background 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#005f94'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#0077B5'; }}
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
