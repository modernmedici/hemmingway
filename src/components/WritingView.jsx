import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Check, Loader2, Maximize2 } from 'lucide-react';
import { FONTS } from '../lib/constants';

export default function WritingView({ post, defaultColumn, onSave, onCancel }) {
  const [title,  setTitle]  = useState(post?.title ?? '');
  const [body,   setBody]   = useState(post?.body  ?? '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [countChanged, setCountChanged] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const titleRef = useRef(null);
  const containerRef = useRef(null);

  const wordCount = useMemo(() => {
    const combinedText = `${title} ${body}`.trim();
    if (!combinedText) return 0;
    return combinedText.split(/\s+/).length;
  }, [title, body]);

  useEffect(() => {
    if (wordCount > 0) {
      setCountChanged(true);
      const timer = setTimeout(() => setCountChanged(false), 300);
      return () => clearTimeout(timer);
    }
  }, [wordCount]);

  const originalTitle = post?.title ?? '';
  const originalBody  = post?.body  ?? '';

  // Keep latest values accessible in the keydown handler without re-registering
  const latestRef = useRef({ title, body, onSave, onCancel });
  latestRef.current = { title, body, onSave, onCancel };

  const enterZenMode = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setZenMode(true);
    } catch (err) {
      console.error('Failed to enter fullscreen:', err);
      // Fallback to just hiding UI
      setZenMode(true);
    }
  }, []);

  const exitZenMode = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setZenMode(false);
    } catch (err) {
      console.error('Failed to exit fullscreen:', err);
      setZenMode(false);
    }
  }, []);

  // Listen for fullscreen changes (user can exit with ESC or F11)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && zenMode) {
        setZenMode(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [zenMode]);

  const handleCancel = useCallback(async () => {
    const { title, body, onCancel, onSave } = latestRef.current;
    const dirty = title !== originalTitle || body !== originalBody;

    // Auto-save if there are changes and title is not empty
    if (dirty && title.trim()) {
      await onSave(title.trim(), body.trim(), defaultColumn);
    }

    onCancel();
  }, [originalTitle, originalBody, defaultColumn]);

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
      if (e.key === 'Escape') {
        if (zenMode) {
          exitZenMode();
        } else {
          handleCancel();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        const { title, body, onSave } = latestRef.current;
        if (title.trim()) onSave(title.trim(), body.trim(), defaultColumn);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        if (zenMode) {
          exitZenMode();
        } else {
          enterZenMode();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleCancel, zenMode, defaultColumn, enterZenMode, exitZenMode]);

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(title.trim(), body.trim(), defaultColumn);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  };

  const canSave = title.trim().length > 0 && !saving;

  return (
    <div ref={containerRef} className="view-enter" style={{ minHeight: '100vh', background: 'hsl(var(--background))', display: 'flex', flexDirection: 'column', fontFamily: FONTS.inter, position: 'relative' }}>
      {/* Zen mode indicator */}
      {zenMode && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 20,
          opacity: 0, transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = 1; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = 0; }}
        className="zen-mode-indicator"
        >
          <button
            onClick={exitZenMode}
            style={{
              fontSize: '11px', fontFamily: FONTS.inter,
              background: 'hsl(var(--muted))',
              color: 'hsl(var(--muted-foreground))',
              border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '6px 12px', cursor: 'pointer',
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'hsl(var(--secondary))';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'hsl(var(--muted))';
            }}
          >
            Exit Fullscreen (Esc)
          </button>
        </div>
      )}

      {/* Sticky header */}
      {!zenMode && (<div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'hsl(var(--background) / 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid hsl(var(--border))',
        padding: '14px 40px 14px 88px',
        display: 'flex', alignItems: 'center',
      }}>
        <button
          onClick={handleCancel}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', fontSize: '12px', fontFamily: FONTS.inter, padding: 0, transition: 'all 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'hsl(var(--foreground))'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <ArrowLeft size={14} />
          Back to Board
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Saved indicator */}
          {saved && (
            <span style={{
              fontSize: '11px',
              fontFamily: FONTS.inter,
              color: 'hsl(var(--primary))',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              animation: 'fadeOut 1.5s ease-out forwards',
            }}>
              <Check size={12} />
              Saved!
            </span>
          )}
          {/* Word count */}
          <span style={{
            fontSize: '11px',
            fontFamily: FONTS.inter,
            color: countChanged ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
            fontVariantNumeric: 'tabular-nums',
            transform: countChanged ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.2s ease',
          }}>
            {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
          </span>
          {/* Zen Mode Toggle */}
          <button
            onClick={enterZenMode}
            title="Fullscreen (⌘⇧F)"
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'hsl(var(--muted-foreground))',
              fontSize: '11px', fontFamily: FONTS.inter,
              padding: '5px 8px',
              transition: 'all 0.12s',
              borderRadius: 'var(--radius-sm)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'hsl(var(--foreground))';
              e.currentTarget.style.background = 'hsl(var(--secondary))';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
              e.currentTarget.style.background = 'none';
            }}
          >
            <Maximize2 size={14} />
          </button>
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
              transition: 'all 0.12s',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
            onMouseDown={e => { if (canSave) e.currentTarget.style.transform = 'scale(0.95)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {saving && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>)}

      {/* Editor */}
      <div style={{ flex: 1, maxWidth: '768px', width: '100%', margin: '0 auto', padding: zenMode ? '128px 32px' : '64px 32px 48px' }}>
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

      {!zenMode && (
        <div style={{ borderTop: '1px solid hsl(var(--border))', padding: '10px 40px', textAlign: 'center' }}>
          <span style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'hsl(var(--muted-foreground))', fontFamily: FONTS.inter }}>
            ⌘↵ to save · ⌘⇧F for fullscreen · Esc to go back
          </span>
        </div>
      )}
    </div>
  );
}
