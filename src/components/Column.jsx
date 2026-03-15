import PostCard from './PostCard';

const COLUMNS = ['ideas', 'drafts', 'finalized'];

export default function Column({ column, posts, onMovePost, onDeletePost, onNewPost, onEditPost }) {
  const colIndex = COLUMNS.indexOf(column.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #e5e5e5' }}>
        <h2 style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#999' }}>
          {column.label}
        </h2>
        <span style={{ fontSize: '11px', color: '#ccc', fontVariantNumeric: 'tabular-nums' }}>
          {posts.length > 0 ? posts.length : ''}
        </span>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 14rem)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {posts.length === 0 && (
          <p style={{ fontSize: '11px', fontStyle: 'italic', color: '#ccc', paddingTop: '8px' }}>Nothing here yet.</p>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onMove={onMovePost}
            onDelete={onDeletePost}
            onEdit={onEditPost}
            isFirst={colIndex === 0}
            isLast={colIndex === COLUMNS.length - 1}
          />
        ))}
      </div>

      {/* Footer */}
      <button
        onClick={() => onNewPost(column.id)}
        style={{
          marginTop: '12px',
          width: '100%',
          border: '1px dashed #d4d4d4',
          borderRadius: '4px',
          padding: '8px 0',
          fontSize: '11px',
          color: '#bbb',
          background: 'none',
          cursor: 'pointer',
          letterSpacing: '0.05em',
          transition: 'border-color 0.15s, color 0.15s',
          fontFamily: "'IBM Plex Mono', monospace",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#aaa'; e.currentTarget.style.color = '#666'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#d4d4d4'; e.currentTarget.style.color = '#bbb'; }}
      >
        + New post
      </button>
    </div>
  );
}
