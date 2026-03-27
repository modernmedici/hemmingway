import { useState, useEffect, useCallback } from 'react';
import { X, Key } from 'lucide-react';
import { FONTS } from '../lib/constants';

export default function SettingsModal({ onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.api.settings.getApiKey().then(k => setApiKey(k ?? ''));
  }, []);

  // Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('API key cannot be empty');
      return;
    }
    setError('');
    await window.api.settings.setApiKey(apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [apiKey]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'hsl(var(--foreground) / 0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          width: '420px',
          boxShadow: '0 8px 32px hsl(var(--foreground) / 0.12)',
          fontFamily: FONTS.inter,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={16} color="hsl(var(--muted-foreground))" />
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>Settings</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', padding: '2px', lineHeight: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* API Key field */}
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
          Anthropic API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={e => { setApiKey(e.target.value); setError(''); setSaved(false); }}
          placeholder="sk-ant-..."
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '8px 12px', fontSize: '13px',
            border: `1px solid ${error ? 'hsl(var(--destructive))' : 'hsl(var(--border))'}`,
            borderRadius: 'var(--radius-md)',
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            fontFamily: FONTS.inter, outline: 'none',
          }}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
        />
        {error && (
          <p style={{ fontSize: '11px', color: 'hsl(var(--destructive))', marginTop: '4px' }}>{error}</p>
        )}

        <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '8px', lineHeight: '1.5' }}>
          Used by the Hemingway Coach. Stored locally on this device.
        </p>

        {/* Save button */}
        <button
          onClick={handleSave}
          style={{
            marginTop: '20px', width: '100%',
            padding: '9px', fontSize: '13px', fontWeight: 500,
            background: saved ? 'hsl(142 72% 29%)' : 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            border: 'none', borderRadius: 'var(--radius-md)',
            cursor: 'pointer', fontFamily: FONTS.inter,
            transition: 'background 0.2s',
          }}
        >
          {saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>
    </div>
  );
}
