import { motion, AnimatePresence } from 'framer-motion';
import { COLUMN_IDS, FONTS } from '../lib/constants';
import PostCard from './PostCard';

export default function Column({ column, posts, onMovePost, onDeletePost, onNewPost, onEditPost, onPublish, linkedin, getTier, onCoach }) {
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
      <div style={{
        flex: 1, overflowY: 'auto',
        maxHeight: 'calc(100vh - 14rem)',
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        <AnimatePresence>
          {posts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                border: '1px dashed hsl(var(--border))',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                textAlign: 'center',
                fontSize: '12px',
                color: 'hsl(var(--muted-foreground))',
                fontFamily: FONTS.inter,
              }}
            >
              Empty
            </motion.div>
          )}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onMove={onMovePost}
              onDelete={onDeletePost}
              onEdit={onEditPost}
              onPublish={onPublish}
              linkedin={linkedin}
              stalenessTier={getTier ? getTier(post.id) : null}
              onCoach={onCoach}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <button
        onClick={() => onNewPost(column.id)}
        style={{
          marginTop: '12px', width: '100%',
          border: '1px dashed hsl(var(--border))',
          borderRadius: 'var(--radius-md)',
          padding: '8px 0', fontSize: '12px',
          color: 'hsl(var(--muted-foreground))',
          background: 'none', cursor: 'pointer',
          fontFamily: FONTS.inter, transition: 'background 0.12s, color 0.12s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; e.currentTarget.style.color = 'hsl(var(--foreground))'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; }}
      >
        + New post
      </button>
    </div>
  );
}
