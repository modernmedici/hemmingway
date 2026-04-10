import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import { COLUMN_IDS, FONTS } from '../lib/constants';
import PostCard from './PostCard';

export default function Column({ column, posts, onMovePost, onDeletePost, onNewPost, onEditPost }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minWidth: 0,
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border) / 0.5)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{
          fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))',
          fontFamily: FONTS.inter,
        }}>
          {column.label}
        </h2>
        {posts.length > 0 && (
          <span style={{
            fontSize: '11px', fontWeight: 500,
            background: 'hsl(var(--secondary))',
            color: 'hsl(var(--muted-foreground))',
            borderRadius: '999px', padding: '1px 8px',
            fontFamily: FONTS.inter,
          }}>
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
        style={{
          flex: 1, overflowY: 'auto',
          maxHeight: 'calc(100vh - 14rem)',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}
      >
        <AnimatePresence>
          {posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                border: '1px dashed hsl(var(--border))',
                borderRadius: 'var(--radius-md)',
                padding: '32px 24px',
                textAlign: 'center',
                fontSize: '12px',
                color: 'hsl(var(--muted-foreground))',
                fontFamily: FONTS.inter,
              }}
            >
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center', opacity: 0.3 }}>
                <FileText size={32} color="hsl(var(--muted-foreground))" />
              </div>
              <p style={{ marginBottom: '4px', fontWeight: 500 }}>No {column.label.toLowerCase()} yet</p>
              <p style={{ fontSize: '11px', opacity: 0.7 }}>
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
