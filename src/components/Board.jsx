import { COLUMNS, FONTS } from '../lib/constants';
import Column from './Column';

export default function Board({ posts, loading, error, onMovePost, onDeletePost, onNewPost, onEditPost, onCoachPost, getTier }) {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', height: '100%' }}>
        {COLUMNS.map(col => (
          <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '20px', width: '80px', borderRadius: '6px', background: 'hsl(var(--muted))', marginBottom: '4px' }} />
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '90px', borderRadius: '8px', background: 'hsl(var(--muted))', opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ fontSize: '13px', fontFamily: FONTS.inter, color: 'hsl(var(--destructive))' }}>
          Failed to load posts: {error}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', height: '100%' }}>
      {COLUMNS.map((column) => (
        <Column
          key={column.id}
          column={column}
          posts={posts.filter(p => p.column === column.id)}
          onMovePost={onMovePost}
          onDeletePost={onDeletePost}
          onNewPost={onNewPost}
          onEditPost={onEditPost}
          onCoachPost={onCoachPost}
          getTier={getTier}
        />
      ))}
    </div>
  );
}
