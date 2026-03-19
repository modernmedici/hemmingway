import { COLUMNS } from '../lib/constants';
import Column from './Column';

export default function Board({ posts, loading, onMovePost, onDeletePost, onNewPost, onEditPost }) {
  if (loading) return null;
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
        />
      ))}
    </div>
  );
}
