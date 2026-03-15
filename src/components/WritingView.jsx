import { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const COLUMNS = [
  { id: 'ideas', label: 'Ideas' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'finalized', label: 'Finalized Posts' },
];

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

  const mono = "'IBM Plex Mono', monospace";

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', fontFamily: mono }}>
      {/* Top bar */}
      <div style={{ borderBottom: '1px solid #e5e5e5', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onCancel}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '12px', fontFamily: mono, letterSpacing: '0.05em', padding: 0 }}
          onMouseEnter={e => { e.currentTarget.style.color = '#111'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; }}
        >
          <ArrowLeft size={14} />
          Board
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={column}
            onChange={(e) => setColumn(e.target.value)}
            style={{
              fontSize: '11px',
              fontFamily: mono,
              letterSpacing: '0.08em',
              color: '#666',
              border: '1px solid #e5e5e5',
              borderRadius: '3px',
              padding: '4px 8px',
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
            disabled={!title.trim()}
            style={{
              fontSize: '11px',
              fontFamily: mono,
              letterSpacing: '0.08em',
              fontWeight: 500,
              background: title.trim() ? '#4a90d9' : '#e5e5e5',
              color: title.trim() ? '#fff' : '#aaa',
              border: 'none',
              borderRadius: '3px',
              padding: '5px 14px',
              cursor: title.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s',
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Writing area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '680px', width: '100%', margin: '0 auto', padding: '64px 24px 48px' }}>
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title of your post"
          style={{
            fontSize: '26px',
            fontWeight: 600,
            fontFamily: mono,
            color: '#111',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            width: '100%',
            marginBottom: '32px',
            lineHeight: '1.3',
          }}
        />

        <div style={{ width: '40px', height: '1px', background: '#e5e5e5', marginBottom: '32px' }} />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Start writing here..."
          style={{
            flex: 1,
            minHeight: '400px',
            fontSize: '15px',
            fontFamily: mono,
            lineHeight: '2',
            color: '#333',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            width: '100%',
          }}
        />
      </div>

      {/* Footer hint */}
      <div style={{ borderTop: '1px solid #e5e5e5', padding: '12px 32px', textAlign: 'center' }}>
        <span style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#ccc', fontFamily: mono }}>
          ⌘↵ to save · Esc to go back
        </span>
      </div>
    </div>
  );
}
