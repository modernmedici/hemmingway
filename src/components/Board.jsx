import Column from './Column';

const COLUMNS = [
  { id: 'ideas',     label: 'Scratchpad' },
  { id: 'drafts',    label: 'Drafts' },
  { id: 'finalized', label: 'Published' },
];

export default function Board({ posts, onMovePost, onDeletePost, onNewPost, onEditPost, onPublish, linkedin }) {
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
