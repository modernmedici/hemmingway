import { COLUMNS } from '../lib/constants';
import Column from './Column';

export default function Board({ posts, loading, onMovePost, onDeletePost, onNewPost, onEditPost, onPublish, linkedin }) {
  if (loading) return null; // posts load nearly instantly from disk; no spinner needed
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
          onPublish={onPublish}
          linkedin={linkedin}
        />
      ))}
    </div>
  );
}
