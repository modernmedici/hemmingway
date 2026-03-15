import Column from './Column';

const COLUMNS = [
  { id: 'ideas', label: 'Ideas' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'finalized', label: 'Finalized Posts' },
];

export default function Board({ posts, onMovePost, onDeletePost, onNewPost, onEditPost }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', height: '100%' }}>
      {COLUMNS.map((column) => {
        const columnPosts = posts.filter((p) => p.column === column.id);
        return (
          <Column
            key={column.id}
            column={column}
            posts={columnPosts}
            onMovePost={onMovePost}
            onDeletePost={onDeletePost}
            onNewPost={onNewPost}
            onEditPost={onEditPost}
          />
        );
      })}
    </div>
  );
}
