import { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { FONTS, COLUMN_LABELS } from '../lib/constants';

function idleDays(updatedAt) {
  return Math.floor((Date.now() - new Date(updatedAt)) / 86400000);
}

async function fetchCoachQuestion(post, signal) {
  const body = post.body?.slice(0, 2000) || '(no draft yet)';
  const res = await fetch('/api/coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: post.title, body }),
    signal,
  });

  if (res.status === 429 || res.status === 529) {
    throw Object.assign(new Error('busy'), { code: 'busy' });
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  // Anthropic response: data.content[0].text
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('empty_response');
  return text;
}

export default function CoachingModal({ post, onClose, onOpenEditor, onMoveToDraft, onSnooze }) {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // null | 'busy' | 'generic'
  const [snoozeValue, setSnoozeValue] = useState(3);
  const [inflight, setInflight] = useState(false);
  const abortRef = useRef(null);

  const ask = async () => {
    setLoading(true);
    setError(null);
    setQuestion(null);
    setInflight(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const q = await fetchCoachQuestion(post, controller.signal);
      setQuestion(q);
    } catch (e) {
      if (e.name === 'AbortError') return;
      setError(e.code === 'busy' ? 'busy' : 'generic');
    } finally {
      setLoading(false);
      setInflight(false);
    }
  };

  useEffect(() => {
    ask();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const days = idleDays(post.updatedAt);
  const columnLabel = COLUMN_LABELS[post.column] ?? post.column;
  const isIdeas = post.column === 'ideas';

  const handleSnooze = () => {
    onSnooze(post.id, snoozeValue);
    onClose();
  };

  const handleMoveToDraft = () => {
    onMoveToDraft(post.id);
    onClose();
    onOpenEditor(post);
  };

  return (
    /* Overlay */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONTS.inter,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius-lg)',
          padding: '28px 28px 24px',
          width: '100%', maxWidth: '480px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'hsl(var(--muted-foreground))', padding: '2px', lineHeight: 0,
          }}
        >
          <X size={16} />
        </button>

        {/* Eyebrow */}
        <p style={{
          fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#D4A853',
          marginBottom: '6px',
        }}>
          Hemingway Coach
        </p>

        {/* Post title + idle duration */}
        <h2 style={{
          fontSize: '16px', fontWeight: 700, fontFamily: FONTS.serif,
          color: 'hsl(var(--foreground))', lineHeight: '1.3',
          marginBottom: '4px',
        }}>
          {post.title}
        </h2>
        <p style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '20px' }}>
          Sitting in {columnLabel} for {days} day{days !== 1 ? 's' : ''}
        </p>

        {/* Question area */}
        <div style={{
          minHeight: '64px',
          borderLeft: '3px solid #D4A853',
          paddingLeft: '14px',
          marginBottom: '16px',
          display: 'flex', alignItems: loading ? 'center' : 'flex-start',
        }}>
          {loading && (
            <Loader2 size={18} color="#D4A853" style={{ animation: 'spin 1s linear infinite' }} />
          )}
          {!loading && error === 'busy' && (
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
              Coach is busy — wait a moment and retry.
            </p>
          )}
          {!loading && error === 'generic' && (
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
              Coach unavailable — try again.
            </p>
          )}
          {!loading && !error && question && (
            <p style={{ fontSize: '14px', color: 'hsl(var(--foreground))', lineHeight: '1.6' }}>
              {question}
            </p>
          )}
        </div>

        {/* Body preview */}
        {post.body && (
          <p style={{
            fontSize: '12px', fontStyle: 'italic',
            color: 'hsl(var(--muted-foreground))', lineHeight: '1.6',
            marginBottom: '20px',
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          }}>
            {post.body}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            disabled={inflight}
            onClick={() => { onClose(); onOpenEditor(post); }}
            style={{ ...btnStyle, opacity: inflight ? 0.5 : 1 }}
          >
            Open in Editor
          </button>

          <button
            disabled={inflight}
            onClick={ask}
            style={{ ...btnStyle, opacity: inflight ? 0.5 : 1 }}
          >
            {error ? 'Retry' : 'Ask another question'}
          </button>

          {isIdeas && (
            <button
              disabled={inflight}
              onClick={handleMoveToDraft}
              style={{ ...btnStyle, opacity: inflight ? 0.5 : 1 }}
            >
              Turn into draft
            </button>
          )}

          {/* Snooze */}
          <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
            <select
              disabled={inflight}
              value={snoozeValue}
              onChange={e => setSnoozeValue(Number(e.target.value))}
              style={{
                ...btnStyle,
                cursor: 'pointer',
                paddingRight: '8px',
                opacity: inflight ? 0.5 : 1,
              }}
            >
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
            </select>
            <button
              disabled={inflight}
              onClick={handleSnooze}
              style={{ ...btnStyle, opacity: inflight ? 0.5 : 1 }}
            >
              Snooze
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const btnStyle = {
  padding: '6px 12px',
  border: '1px solid hsl(var(--border))',
  borderRadius: 'var(--radius-md)',
  background: 'none',
  cursor: 'pointer',
  fontSize: '12px',
  fontFamily: "'Inter', sans-serif",
  color: 'hsl(var(--foreground))',
  transition: 'background 0.1s',
  whiteSpace: 'nowrap',
};
