import { useState } from 'react';
import { Users } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { COLUMNS, COLUMN_LABELS } from '../lib/constants';
import Column from './Column';
import CollaboratorAvatars from './CollaboratorAvatars';
import DragOverlayCard from './DragOverlayCard';

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
  const [activePost, setActivePost] = useState(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(pointerSensor, keyboardSensor);

  const announcements = {
    onDragStart({ active }) {
      const title = active.data.current.post.title;
      return `Picked up card "${title}".`;
    },
    onDragOver({ active, over }) {
      if (!over) return;
      const title = active.data.current.post.title;
      const col = COLUMN_LABELS[over.id];
      return `Card "${title}" is over ${col}.`;
    },
    onDragEnd({ active, over }) {
      const title = active.data.current.post.title;
      if (!over || active.data.current.columnId === over.id) {
        return `Card "${title}" was dropped back in its original column.`;
      }
      const col = COLUMN_LABELS[over.id];
      return `Card "${title}" was moved to ${col}.`;
    },
    onDragCancel({ active }) {
      return `Dragging cancelled. Card "${active.data.current.post.title}" returned to its original position.`;
    },
  };

  function handleDragStart(event) {
    const { post, columnId } = event.active.data.current;
    setActivePost({ post, columnId });
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActivePost(null);

    if (!over) return;

    const sourceColumn = active.data.current.columnId;
    const targetColumn = over.id;

    if (sourceColumn === targetColumn) return;

    onMovePost(active.id, targetColumn);
  }

  function handleDragCancel() {
    setActivePost(null);
  }
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
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              {board.name}
            </h1>
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        accessibility={{ announcements }}
      >
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

        <DragOverlay>
          {activePost ? (
            <DragOverlayCard post={activePost.post} columnId={activePost.columnId} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
