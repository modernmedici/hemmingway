import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import PostCard from './PostCard';

export default function Column({ column, posts, onMovePost, onDeletePost, onNewPost, onEditPost, showAttribution, boardName }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col min-w-0 bg-card rounded-lg p-5"
      style={{
        border: isOver
          ? '1.5px solid hsl(var(--primary) / 0.4)'
          : '1px solid hsl(var(--border) / 0.5)',
        backgroundColor: isOver
          ? 'hsl(var(--accent) / 0.15)'
          : undefined,
        boxShadow: isOver
          ? '0 0 0 3px hsl(var(--primary) / 0.08)'
          : '0 1px 2px hsl(var(--foreground) / 0.03)',
        transition: 'border 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[12px] font-medium tracking-widest uppercase text-muted-foreground font-sans">
          {column.label}
        </h2>
        {posts.length > 0 && (
          <span className="text-[11px] font-medium bg-secondary text-muted-foreground rounded-full px-2 py-px font-sans">
            {posts.length}
          </span>
        )}
      </div>

      {/* Cards */}
      <SortableContext items={posts.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
          className="flex-1 overflow-y-auto max-h-[calc(100vh-14rem)] flex flex-col gap-4"
        >
          <AnimatePresence>
            {posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-md p-8 text-center font-sans"
            >
              <div className="mb-3 flex justify-center opacity-20">
                <FileText size={28} className="text-muted-foreground" />
              </div>
              {column.id === 'ideas' && (
                <>
                  <p className="text-xs font-medium text-foreground/70 mb-1">Start with a rough idea</p>
                  <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                    Just a title is enough. Don't overthink it.
                  </p>
                </>
              )}
              {column.id === 'drafts' && (
                <>
                  <p className="text-xs font-medium text-foreground/70 mb-1">Flesh out your thoughts</p>
                  <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                    Move ideas here when you're ready to develop them.
                  </p>
                </>
              )}
              {column.id === 'finalized' && (
                <>
                  <p className="text-xs font-medium text-foreground/70 mb-1">Your finished work lives here</p>
                  <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                    Posts you're proud to share.
                  </p>
                </>
              )}
            </motion.div>
          )}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onMove={onMovePost}
              onDelete={onDeletePost}
              onEdit={onEditPost}
              showAttribution={showAttribution}
              boardName={boardName}
              columnId={column.id}
            />
          ))}
          </AnimatePresence>
        </motion.div>
      </SortableContext>
    </div>
  );
}
