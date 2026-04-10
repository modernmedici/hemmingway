import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, MoreHorizontal, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { COLUMN_IDS, COLUMN_LABELS } from '../lib/constants';

const wordCount = (text) => {
  const trimmed = text?.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
};

export default function PostCard({ post, onMove, onDelete, onEdit }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [hovered, setHovered] = useState(false);
  const totalWords = wordCount((post.title ?? '') + ' ' + (post.body ?? ''));

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(post.id);
    } else {
      setConfirmDelete(true);
    }
  };

  const handleMove = (e, targetCol) => {
    e.stopPropagation();
    onMove(post.id, targetCol);
    setMenuOpen(false);
  };

  return (
    <motion.div
      layout
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
      }}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18 }}
      onClick={() => { if (menuOpen) return; onEdit(post); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); setMenuOpen(false); }}
      className="border border-border/50 rounded-md bg-card p-3.5 cursor-pointer relative transition-shadow duration-150"
      style={{
        boxShadow: hovered ? '0 2px 8px hsl(var(--foreground) / 0.06)' : 'none',
      }}
    >
      {/* Top row: word count badge + three-dot menu */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-sans font-medium text-muted-foreground bg-secondary rounded-full px-2 py-px">
          {totalWords} {totalWords === 1 ? 'word' : 'words'}
        </span>

        <div className="relative">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(m => !m); }}
            className="bg-transparent border-none cursor-pointer p-0.5 leading-none transition-colors duration-100"
            style={{
              color: hovered ? 'hsl(var(--muted-foreground))' : 'transparent',
            }}
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              onClick={e => e.stopPropagation()}
              className="absolute right-0 top-full z-50 bg-card border border-border rounded-md shadow-[0_4px_16px_hsl(var(--foreground)/0.1)] p-1 min-w-[160px] font-sans text-xs"
            >
              {COLUMN_IDS.filter(c => c !== post.column).map(col => (
                <button
                  key={col}
                  onClick={e => handleMove(e, col)}
                  className="flex items-center w-full px-2 py-1.5 bg-transparent border-none cursor-pointer text-foreground rounded-sm text-xs font-sans text-left transition-colors duration-100 hover:bg-accent"
                >
                  Move to {COLUMN_LABELS[col]}
                </button>
              ))}

              <div className="h-px bg-border my-1" />

              {confirmDelete ? (
                <div className="px-2 py-1 flex gap-2 items-center">
                  <span className="text-[11px] text-muted-foreground">Delete?</span>
                  <button
                    onClick={handleDelete}
                    className="flex items-center px-1 py-0.5 bg-transparent border-none cursor-pointer text-destructive rounded-sm text-xs font-sans text-left transition-colors duration-100 hover:bg-accent"
                  >
                    Yes
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setConfirmDelete(false); }}
                    className="flex items-center px-1 py-0.5 bg-transparent border-none cursor-pointer text-foreground rounded-sm text-xs font-sans text-left transition-colors duration-100 hover:bg-accent"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-2 py-1.5 bg-transparent border-none cursor-pointer text-destructive rounded-sm text-xs font-sans text-left transition-colors duration-100 hover:bg-destructive/10"
                >
                  <Trash2 size={12} className="mr-1.5" />
                  Delete
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Title */}
      <p
        className="text-sm font-bold font-serif text-foreground leading-[1.4] transition-colors duration-100"
        style={{ marginBottom: post.body ? '6px' : '10px' }}
      >
        {post.title}
      </p>

      {/* Body preview */}
      {post.body && (
        <p className="text-xs font-sans text-muted-foreground leading-relaxed overflow-hidden mb-2.5 line-clamp-3">
          {post.body}
        </p>
      )}

      {/* Bottom row: timestamp + icon */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-sans">
          {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
        </span>
        <FileText size={13} className="text-muted-foreground" />
      </div>
    </motion.div>
  );
}
