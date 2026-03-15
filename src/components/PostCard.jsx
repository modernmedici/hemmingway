import { useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

const COLUMNS = ['ideas', 'drafts', 'finalized'];

export default function PostCard({ post, onMove, onDelete, onEdit, isFirst, isLast }) {
  const [hovered, setHovered] = useState(false);
  const currentIndex = COLUMNS.indexOf(post.column);

  const moveLeft = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) onMove(post.id, COLUMNS[currentIndex - 1]);
  };

  const moveRight = (e) => {
    e.stopPropagation();
    if (currentIndex < COLUMNS.length - 1) onMove(post.id, COLUMNS[currentIndex + 1]);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${post.title}"?`)) {
      onDelete(post.id);
    }
  };

  return (
    <div
      onClick={() => onEdit(post)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: '1px solid #e5e5e5',
        borderRadius: '4px',
        background: hovered ? '#fafafa' : '#fff',
        padding: '12px',
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
    >
      <p style={{ fontSize: '13px', fontWeight: 500, color: '#111', lineHeight: '1.4', marginBottom: post.body ? '6px' : 0 }}>
        {post.title}
      </p>
      {post.body && (
        <p style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.6', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {post.body}
        </p>
      )}
      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '2px' }}>
        <button
          onClick={moveLeft}
          disabled={isFirst}
          title="Move left"
          style={{ padding: '2px', background: 'none', border: 'none', cursor: isFirst ? 'not-allowed' : 'pointer', color: isFirst ? '#e5e5e5' : '#ccc', lineHeight: 0 }}
          onMouseEnter={e => { if (!isFirst) e.currentTarget.style.color = '#555'; }}
          onMouseLeave={e => { e.currentTarget.style.color = isFirst ? '#e5e5e5' : '#ccc'; }}
        >
          <ChevronLeft size={13} />
        </button>
        <button
          onClick={moveRight}
          disabled={isLast}
          title="Move right"
          style={{ padding: '2px', background: 'none', border: 'none', cursor: isLast ? 'not-allowed' : 'pointer', color: isLast ? '#e5e5e5' : '#ccc', lineHeight: 0 }}
          onMouseEnter={e => { if (!isLast) e.currentTarget.style.color = '#555'; }}
          onMouseLeave={e => { e.currentTarget.style.color = isLast ? '#e5e5e5' : '#ccc'; }}
        >
          <ChevronRight size={13} />
        </button>
        <button
          onClick={handleDelete}
          title="Delete"
          style={{ marginLeft: 'auto', padding: '2px', background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', lineHeight: 0 }}
          onMouseEnter={e => { e.currentTarget.style.color = '#e87474'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#ccc'; }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
