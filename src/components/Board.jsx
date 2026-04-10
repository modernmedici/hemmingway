import { COLUMNS } from '../lib/constants';
import Column from './Column';

export default function Board({ posts, loading, error, onMovePost, onDeletePost, onNewPost, onEditPost }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-5 h-full">
        {COLUMNS.map(col => (
          <div key={col.id} className="flex flex-col gap-2">
            <div className="h-5 w-20 rounded-md bg-muted mb-1" />
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[90px] rounded-lg bg-muted" style={{ opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[13px] font-sans text-destructive">
          Failed to load posts: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-5 h-full">
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
