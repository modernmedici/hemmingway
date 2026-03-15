import { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const COLUMNS = [
  { id: 'ideas', label: 'Ideas' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'finalized', label: 'Finalized Posts' },
];

const mono = "'IBM Plex Mono', monospace";
const serif = "'Playfair Display', Georgia, serif";

export default function WritingView({ post, defaultColumn, onSave, onCancel }) {
  const [title, setTitle] = useState(post?.title ?? '');
  const [body, setBody] = useState(post?.body ?? '');
  const [column, setColumn] = useState(defaultColumn ?? 'ideas');
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (title.trim()) onSave(title.trim(), body.trim(), column);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, body, column, onSave, onCancel]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title.trim(), body.trim(), column);
  };

  const canSave = title.trim().length > 0;

  return (
    <div className="view-enter" style={{ minHeight: '100vh', background: '#f7f5f0', display: 'flex', flexDirection: 'column', fontFamily: mono }}>
      {/* Top bar */}
      <div style={{ borderBottom: '1px solid #e8e4dd', padding: '14px 40px', display: 'flex', alignItems: 'center', background: '#f7f5f0' }}>
        <button
          onClick={onCancel}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#b0a99e', fontSize: '11px', fontFamily: mono, letterSpacing: '0.08em', padding: 0, transition: 'color 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#1a1714'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#b0a99e'; }}
        >
          <ArrowLeft size={13} />
          Board
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={column}
            onChange={(e) => setColumn(e.target.value)}
            style={{
              fontSize: '10px',
              fontFamily: mono,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#8a8278',
              border: '1px solid #e8e4dd',
              borderRadius: '3px',
              padding: '5px 8px',
              background: '#fff',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {COLUMNS.map((col) => (
              <option key={col.id} value={col.id}>{col.label}</option>
            ))}
          </select>

          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              fontSize: '11px',
              fontFamily: mono,
              letterSpacing: '0.08em',
              fontWeight: 500,
              background: canSave ? '#1a1714' : '#e8e4dd',
              color: canSave ? '#f7f5f0' : '#b0a99e',
              border: 'none',
              borderRadius: '3px',
              padding: '6px 16px',
              cursor: canSave ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { if (canSave) e.currentTarget.style.background = '#3a3330'; }}
            onMouseLeave={e => { if (canSave) e.currentTarget.style.background = '#1a1714'; }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Writing area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '680px', width: '100%', margin: '0 auto', padding: '72px 24px 48px' }}>
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{
            fontSize: '32px',
            fontWeight: 700,
            fontFamily: serif,
            color: '#1a1714',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            width: '100%',
            marginBottom: '28px',
            lineHeight: '1.25',
          }}
        />

        <div style={{ width: '32px', height: '1px', background: '#d4cfc9', marginBottom: '28px' }} />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Begin writing..."
          style={{
            flex: 1,
            minHeight: '420px',
            fontSize: '14px',
            fontFamily: mono,
            lineHeight: '2.1',
            color: '#3a3330',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            width: '100%',
          }}
        />
      </div>

      {/* Footer hint */}
      <div style={{ borderTop: '1px solid #e8e4dd', padding: '10px 40px', textAlign: 'center' }}>
        <span style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#c8c2b8', fontFamily: mono }}>
          ⌘↵ to save · Esc to go back
        </span>
      </div>
    </div>
  );
}
