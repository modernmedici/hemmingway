import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { FONTS } from '../lib/constants';

const ERROR_MESSAGES = {
  auth: 'Invalid API key — check Settings',
  busy: 'Coach is busy — wait a moment and retry',
  timeout: 'Coach unavailable — try again',
  error: 'Coach unavailable — try again',
};

export default function CoachingModal({ post, onClose, onSnooze, onMovePost }) {
  const [state, setState] = useState('loading'); // loading | success | error
  const [question, setQuestion] = useState('');
  const [errorCode, setErrorCode] = useState(null);

  const fetchQuestion = useCallback(async () => {
    setState('loading');
    setErrorCode(null);
    try {
      const text = await window.api.coach.ask({ title: post.title, body: post.body });
      setQuestion(text);
      setState('success');
    } catch (e) {
      setErrorCode(e?.code ?? 'error');
      setState('error');
    }
  }, [post]);

  useEffect(() => { fetchQuestion(); }, [fetchQuestion]);

  // Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isLoading = state === 'loading';

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
          width: '440px',
          boxShadow: '0 8px 32px hsl(var(--foreground) / 0.12)',
          fontFamily: FONTS.inter,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>
            Coach · {post.title}
          </p>
          <button
            aria-label="Close"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', padding: '2px', lineHeight: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          {isLoading && (
            <div
              role="status"
              aria-label="Loading"
              style={{
                width: '24px', height: '24px',
                border: '2px solid hsl(var(--border))',
                borderTopColor: 'hsl(var(--primary))',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }}
            />
          )}
          {state === 'success' && (
            <p style={{
              fontSize: '16px', fontFamily: FONTS.serif, fontWeight: 500,
              color: 'hsl(var(--foreground))', lineHeight: '1.5', textAlign: 'center',
            }}>
              {question}
            </p>
          )}
          {state === 'error' && (
            <p style={{ fontSize: '13px', color: 'hsl(var(--destructive))', textAlign: 'center' }}>
              {ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={fetchQuestion}
            disabled={isLoading}
            style={actionButtonStyle(isLoading, false)}
          >
            Ask another question
          </button>

          {state === 'success' && post.column === 'ideas' && onMovePost && (
            <button
              onClick={() => { onMovePost(post.id, 'drafts'); onClose(); }}
              disabled={isLoading}
              style={actionButtonStyle(isLoading, false)}
            >
              Turn into draft
            </button>
          )}

          <button
            onClick={() => { onSnooze(post.id, 1); onClose(); }}
            disabled={isLoading}
            style={actionButtonStyle(isLoading, true)}
          >
            Snooze 1 day
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function actionButtonStyle(disabled, muted) {
  return {
    padding: '8px 14px', fontSize: '12px', fontWeight: 500,
    fontFamily: FONTS.inter, border: 'none', borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    background: muted ? 'hsl(var(--secondary))' : 'hsl(var(--primary))',
    color: muted ? 'hsl(var(--foreground))' : 'hsl(var(--primary-foreground))',
    transition: 'opacity 0.15s',
  };
}
