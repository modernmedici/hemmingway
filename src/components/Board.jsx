import { COLUMNS, FONTS } from '../lib/constants';
import Column from './Column';

export default function Board({ posts, onMovePost, onDeletePost, onNewPost, onEditPost, onPublish, linkedin, getTier, onCoach, staleCount }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      {/* Header count badge */}
      {staleCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '12px', fontFamily: FONTS.inter,
          color: '#D4A853',
        }}>
          <span style={{
            background: '#D4A853', color: 'white',
            borderRadius: '999px', padding: '1px 8px',
            fontSize: '11px', fontWeight: 600,
          }}>
            {staleCount}
          </span>
          post{staleCount !== 1 ? 's' : ''} need attention
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', flex: 1 }}>
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            posts={posts.filter(p => p.column === column.id)}
            onMovePost={onMovePost}
            onDeletePost={onDeletePost}
            onNewPost={onNewPost}
            onEditPost={onEditPost}
            onPublish={onPublish}
            linkedin={linkedin}
            getTier={getTier}
            onCoach={onCoach}
          />
        ))}
      </div>
    </div>
  );
}
