import { Users } from 'lucide-react';
import { COLUMNS } from '../lib/constants';
import Column from './Column';
import CollaboratorAvatars from './CollaboratorAvatars';

export default function Board({
  board,
  posts,
  loading,
  error,
  onMovePost,
  onDeletePost,
  onNewPost,
  onEditPost,
  onShareBoard,
  isOwner,
  currentUser
}) {
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

  const isShared = board?.members && board.members.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Board header */}
      {board && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-foreground">
              {board.name}
            </h1>
            {isShared && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/60">
                <Users size={12} className="text-muted-foreground/50" />
                <span className="text-[10px] font-sans font-medium text-muted-foreground/60">
                  Shared
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Show collaborators if board is shared */}
            {isShared && (
              <CollaboratorAvatars boardId={board.id} currentUser={currentUser} />
            )}

            {/* Share button (owner only) */}
            {isOwner && isOwner(board.id) && onShareBoard && (
              <button
                onClick={() => onShareBoard(board)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium rounded-md bg-card text-foreground/70 transition-all duration-150 hover:bg-secondary hover:text-foreground hover:shadow-[0_2px_6px_hsl(var(--foreground)/0.05)] active:scale-95"
                style={{
                  boxShadow: '0 1px 3px hsl(var(--foreground) / 0.04)',
                }}
              >
                <Users size={14} />
                Share Board
              </button>
            )}
          </div>
        </div>
      )}

      {/* Columns grid */}
      <div className="grid grid-cols-3 gap-5 flex-1">
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            posts={posts.filter(p => p.column === column.id)}
            onMovePost={onMovePost}
            onDeletePost={onDeletePost}
            onNewPost={onNewPost}
            onEditPost={onEditPost}
            showAttribution={isShared}
            boardName={board?.name}
          />
        ))}
      </div>
    </div>
  );
}
