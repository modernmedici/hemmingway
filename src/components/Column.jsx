import PostCard from './PostCard';

const COLUMNS = ['ideas', 'drafts', 'finalized'];

export default function Column({ column, posts, onMovePost, onDeletePost, onNewPost, onEditPost }) {
  const colIndex = COLUMNS.indexOf(column.id);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      background: '#fff',
      border: '1px solid #e8e4dd',
      borderRadius: '6px',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f0ece6' }}>
        <h2 style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b0a99e', fontFamily: "'IBM Plex Mono', monospace" }}>
          {column.label}
        </h2>
        {posts.length > 0 && (
          <span style={{ fontSize: '11px', color: '#d4cfc9', fontVariantNumeric: 'tabular-nums', fontFamily: "'IBM Plex Mono', monospace" }}>
            {posts.length}
          </span>
        )}
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 16rem)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {posts.length === 0 && (
          <p style={{ fontSize: '11px', fontStyle: 'italic', color: '#d4cfc9', paddingTop: '4px', fontFamily: "'IBM Plex Mono', monospace" }}>
            Nothing here yet.
          </p>
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
          marginTop: '14px',
          width: '100%',
          border: '1px dashed #ddd8d0',
          borderRadius: '4px',
          padding: '9px 0',
          fontSize: '11px',
          color: '#c8c2b8',
          background: 'none',
          cursor: 'pointer',
          letterSpacing: '0.08em',
          transition: 'border-color 0.15s, color 0.15s',
          fontFamily: "'IBM Plex Mono', monospace",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#b0a99e'; e.currentTarget.style.color = '#6b6460'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#ddd8d0'; e.currentTarget.style.color = '#c8c2b8'; }}
      >
        + New post
      </button>
    </div>
  );
}
