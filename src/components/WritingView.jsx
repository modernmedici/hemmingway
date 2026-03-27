import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { FONTS } from '../lib/constants';

export default function WritingView({ post, defaultColumn, onSave, onCancel }) {
  const [title,  setTitle]  = useState(post?.title ?? '');
  const [body,   setBody]   = useState(post?.body  ?? '');
  const titleRef = useRef(null);

  const originalTitle = post?.title ?? '';
  const originalBody  = post?.body  ?? '';

  // Keep latest values accessible in the keydown handler without re-registering
  const latestRef = useRef({ title, body, onSave, onCancel });
  latestRef.current = { title, body, onSave, onCancel };

  const handleCancel = useCallback(() => {
    const { title, body, onCancel } = latestRef.current;
    const dirty = title !== originalTitle || body !== originalBody;
    if (dirty && !window.confirm('Discard unsaved changes?')) return;
    onCancel();
  }, [originalTitle, originalBody]);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const autoResizeTitle = useCallback(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  useEffect(() => { autoResizeTitle(); }, [title, autoResizeTitle]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') handleCancel();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        const { title, body, onSave } = latestRef.current;
        if (title.trim()) onSave(title.trim(), body.trim(), defaultColumn);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleCancel]); // re-register only if handleCancel identity changes (it doesn't)

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title.trim(), body.trim(), defaultColumn);
  };

  const canSave = title.trim().length > 0;

  return (
    <div className="view-enter" style={{ minHeight: '100vh', background: 'hsl(var(--background))', display: 'flex', flexDirection: 'column', fontFamily: FONTS.inter }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'hsl(var(--background) / 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid hsl(var(--border))',
        padding: '14px 40px 14px 88px',
        display: 'flex', alignItems: 'center',
      }}>
        <button
          onClick={handleCancel}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', fontSize: '12px', fontFamily: FONTS.inter, padding: 0, transition: 'color 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'hsl(var(--foreground))'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; }}
        >
          <ArrowLeft size={14} />
          Back to Board
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              fontSize: '11px', fontFamily: FONTS.inter, fontWeight: 500,
              background: canSave ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
              color: canSave ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
              border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '5px 14px', cursor: canSave ? 'pointer' : 'not-allowed',
              transition: 'background 0.12s',
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, maxWidth: '768px', width: '100%', margin: '0 auto', padding: '64px 32px 48px' }}>
        <textarea
          ref={titleRef}
          value={title}
          onChange={e => { setTitle(e.target.value); autoResizeTitle(); }}
          placeholder="Essay Title"
          rows={1}
          style={{
            display: 'block', width: '100%',
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700, fontFamily: FONTS.serif,
            color: 'hsl(var(--foreground))',
            border: 'none', outline: 'none',
            background: 'transparent',
            marginBottom: '32px', lineHeight: '1.2',
            resize: 'none', overflow: 'hidden',
          }}
        />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Start writing your thoughts..."
          style={{
            display: 'block', width: '100%',
            minHeight: '500px', fontSize: '17px',
            fontFamily: FONTS.serif, lineHeight: '1.9',
            color: 'hsl(var(--foreground))',
            border: 'none', outline: 'none',
            background: 'transparent', resize: 'none',
          }}
        />
      </div>

      <div style={{ borderTop: '1px solid hsl(var(--border))', padding: '10px 40px', textAlign: 'center' }}>
        <span style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'hsl(var(--muted-foreground))', fontFamily: FONTS.inter }}>
          ⌘↵ to save · Esc to go back
        </span>
      </div>
    </div>
  );
}
