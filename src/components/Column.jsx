import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import PostCard from './PostCard';

export default function Column({ column, posts, onMovePost, onDeletePost, onNewPost, onEditPost }) {
  return (
    <div className="flex flex-col min-w-0 bg-card border border-border/50 rounded-lg p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground font-sans">
          {column.label}
        </h2>
        {posts.length > 0 && (
          <span className="text-[11px] font-medium bg-secondary text-muted-foreground rounded-full px-2 py-px font-sans">
            {posts.length}
          </span>
        )}
      </div>

      {/* Cards */}
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
        className="flex-1 overflow-y-auto max-h-[calc(100vh-14rem)] flex flex-col gap-2"
      >
        <AnimatePresence>
          {posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border border-dashed border-border rounded-md p-8 text-center text-xs text-muted-foreground font-sans"
            >
              <div className="mb-2 flex justify-center opacity-30">
                <FileText size={32} className="text-muted-foreground" />
              </div>
              <p className="mb-1 font-medium">No {column.label.toLowerCase()} yet</p>
              <p className="text-[11px] opacity-70">
                {column.id === 'ideas' && 'Click "+ New Idea" to start writing'}
                {column.id === 'drafts' && 'Move ideas here to develop them'}
                {column.id === 'finalized' && 'Publish your finished work here'}
              </p>
            </motion.div>
          )}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onMove={onMovePost}
              onDelete={onDeletePost}
              onEdit={onEditPost}
            />
          ))}
        </AnimatePresence>
      </motion.div>

    </div>
  );
}
