import { useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const COLUMNS = ['ideas', 'drafts', 'finalized'];
const mono = "'IBM Plex Mono', monospace";

const wordCount = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;

export default function PostCard({ post, onMove, onDelete, onEdit, isFirst, isLast }) {
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const currentIndex = COLUMNS.indexOf(post.column);

  const moveLeft = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) onMove(post.id, COLUMNS[currentIndex - 1]);
  };

  const moveRight = (e) => {
    e.stopPropagation();
    if (currentIndex < COLUMNS.length - 1) onMove(post.id, COLUMNS[currentIndex + 1]);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setConfirmDelete(true);
  };

  const handleDeleteConfirm = (e) => {
    e.stopPropagation();
    onDelete(post.id);
  };

  const handleDeleteCancel = (e) => {
    e.stopPropagation();
    setConfirmDelete(false);
  };

  return (
    <div
      onClick={() => !confirmDelete && onEdit(post)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); }}
      style={{
        border: '1px solid #ede9e3',
        borderRadius: '4px',
        background: '#fdfcfb',
        padding: '11px 12px',
        cursor: confirmDelete ? 'default' : 'pointer',
        transition: 'box-shadow 0.12s',
        boxShadow: hovered && !confirmDelete ? 'inset 3px 0 0 #1a1714' : 'none',
      }}
    >
      <p style={{ fontSize: '12px', fontWeight: 500, color: '#1a1714', lineHeight: '1.5', marginBottom: post.body ? '5px' : 0, fontFamily: mono }}>
        {post.title}
      </p>
      {post.body && (
        <p style={{ fontSize: '11px', color: '#b0a99e', lineHeight: '1.7', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: mono }}>
          {post.body}
        </p>
      )}

      {confirmDelete ? (
        <div
          onClick={e => e.stopPropagation()}
          style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '10px', color: '#9a8f88', fontFamily: mono, letterSpacing: '0.05em' }}>Delete?</span>
          <button
            onClick={handleDeleteConfirm}
            style={{ fontSize: '10px', fontFamily: mono, letterSpacing: '0.05em', color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}
          >
            Yes
          </button>
          <button
            onClick={handleDeleteCancel}
            style={{ fontSize: '10px', fontFamily: mono, letterSpacing: '0.05em', color: '#b0a99e', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            No
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span style={{ fontSize: '10px', color: '#c8c2b8', fontFamily: mono, letterSpacing: '0.06em', marginRight: 'auto' }}>
            {wordCount((post.title + ' ' + (post.body || '')).trim())} words
          </span>
          <button
            onClick={moveLeft}
            disabled={isFirst}
            title="Move left"
            style={{ padding: '2px', background: 'none', border: 'none', cursor: isFirst ? 'not-allowed' : 'pointer', color: isFirst ? '#e8e4dd' : '#ccc8c2', lineHeight: 0, transition: 'color 0.1s' }}
            onMouseEnter={e => { if (!isFirst) e.currentTarget.style.color = '#1a1714'; }}
            onMouseLeave={e => { e.currentTarget.style.color = isFirst ? '#e8e4dd' : '#ccc8c2'; }}
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={moveRight}
            disabled={isLast}
            title="Move right"
            style={{ padding: '2px', background: 'none', border: 'none', cursor: isLast ? 'not-allowed' : 'pointer', color: isLast ? '#e8e4dd' : '#ccc8c2', lineHeight: 0, transition: 'color 0.1s' }}
            onMouseEnter={e => { if (!isLast) e.currentTarget.style.color = '#1a1714'; }}
            onMouseLeave={e => { e.currentTarget.style.color = isLast ? '#e8e4dd' : '#ccc8c2'; }}
          >
            <ChevronRight size={13} />
          </button>
          <button
            onClick={handleDeleteClick}
            title="Delete"
            style={{ padding: '2px', background: 'none', border: 'none', cursor: 'pointer', color: '#ccc8c2', lineHeight: 0, transition: 'color 0.1s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#c0392b'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#ccc8c2'; }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
