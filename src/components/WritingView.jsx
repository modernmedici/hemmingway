import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Loader2, Check, Send } from 'lucide-react';

const COLUMNS = [
  { id: 'ideas',     label: 'Scratchpad' },
  { id: 'drafts',    label: 'Drafts' },
  { id: 'finalized', label: 'Published' },
];

const inter = "'Inter', sans-serif";
const serif = "'Libre Baskerville', Georgia, serif";

export default function WritingView({ post, defaultColumn, onSave, onCancel, linkedin, onPublish }) {
  const [title,  setTitle]  = useState(post?.title ?? '');
  const [body,   setBody]   = useState(post?.body  ?? '');
  const [column, setColumn] = useState(defaultColumn ?? 'ideas');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const titleRef = useRef(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (title.trim()) handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, body, column]);

  const handleSave = () => {
    if (!title.trim()) return;
    setSaving(true);
    setTimeout(() => {
      onSave(title.trim(), body.trim(), column);
      setSaving(false);
      setSaved(true);
    }, 400);
  };

  const handlePublish = async () => {
    if (!post) return;
    await onPublish({ ...post, title: title.trim(), body: body.trim() });
  };

  const canSave = title.trim().length > 0;
  const isFinalized = column === 'finalized';
  const canPublish = isFinalized && linkedin?.isConnected && post;

  return (
    <div className="view-enter" style={{ minHeight: '100vh', background: 'hsl(var(--background))', display: 'flex', flexDirection: 'column', fontFamily: inter }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'hsl(var(--background) / 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid hsl(var(--border))',
        padding: '12px 40px',
        display: 'flex', alignItems: 'center',
      }}>
        <button
          onClick={onCancel}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', fontSize: '12px', fontFamily: inter, padding: 0, transition: 'color 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'hsl(var(--foreground))'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; }}
        >
          <ArrowLeft size={14} />
          Back to Board
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Save status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontFamily: inter }}>
            {saving && <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>}
            {saved && !saving && <><Check size={12} /> Saved</>}
          </div>

          {/* Column selector */}
          <select
            value={column}
            onChange={e => setColumn(e.target.value)}
            style={{
              fontSize: '11px', fontFamily: inter,
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 8px',
              background: 'hsl(var(--background))',
              cursor: 'pointer', outline: 'none',
            }}
          >
            {COLUMNS.map(col => (
              <option key={col.id} value={col.id}>{col.label}</option>
            ))}
          </select>

          {/* Publish to LinkedIn */}
          {canPublish && (
            <button
              onClick={handlePublish}
              disabled={linkedin.publishing}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '11px', fontFamily: inter, fontWeight: 500,
                background: '#0077B5', color: '#fff',
                border: 'none', borderRadius: 'var(--radius-sm)',
                padding: '5px 12px', cursor: 'pointer', transition: 'background 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#005f94'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0077B5'; }}
            >
              <Send size={11} />
              Publish to LinkedIn
            </button>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              fontSize: '11px', fontFamily: inter, fontWeight: 500,
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
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Essay Title"
          style={{
            display: 'block', width: '100%',
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700, fontFamily: serif,
            color: 'hsl(var(--foreground))',
            border: 'none', outline: 'none',
            background: 'transparent',
            marginBottom: '32px', lineHeight: '1.2',
          }}
        />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Start writing your thoughts..."
          style={{
            display: 'block', width: '100%',
            minHeight: '500px', fontSize: '17px',
            fontFamily: serif, lineHeight: '1.9',
            color: 'hsl(var(--foreground))',
            border: 'none', outline: 'none',
            background: 'transparent', resize: 'none',
          }}
        />
      </div>

      <div style={{ borderTop: '1px solid hsl(var(--border))', padding: '10px 40px', textAlign: 'center' }}>
        <span style={{ fontSize: '10px', letterSpacing: '0.1em', color: 'hsl(var(--muted-foreground))', fontFamily: inter }}>
          ⌘↵ to save · Esc to go back
        </span>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
