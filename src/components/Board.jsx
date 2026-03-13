import { useState } from 'react';
import Column from './Column';

const COLUMNS = [
  { id: 'ideas', label: 'Ideas' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'finalized', label: 'Finalized Posts' },
];

export default function Board({ posts, onCreatePost, onUpdatePost, onMovePost, onDeletePost }) {
  const [activeNewPostColumn, setActiveNewPostColumn] = useState(null);

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {COLUMNS.map((column) => {
        const columnPosts = posts.filter((p) => p.column === column.id);
        return (
          <Column
            key={column.id}
            column={column}
            posts={columnPosts}
            onCreatePost={onCreatePost}
            onUpdatePost={onUpdatePost}
            onMovePost={onMovePost}
            onDeletePost={onDeletePost}
            showNewForm={activeNewPostColumn === column.id}
            onShowNewForm={() => setActiveNewPostColumn(column.id)}
            onHideNewForm={() => setActiveNewPostColumn(null)}
          />
        );
      })}
    </div>
  );
}
