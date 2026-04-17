import { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Trash2, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { useDraggable } from '@dnd-kit/core';
import { COLUMN_IDS, COLUMN_LABELS } from '../lib/constants';
import { downloadMarkdown } from '../lib/markdown-export';

const wordCount = (text) => {
  const trimmed = text?.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
};

// Get initials from email
function getInitials(email) {
  if (!email) return '?'
  const parts = email.split('@')[0].split('.')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return email.substring(0, 2).toUpperCase()
}

export default function PostCard({ post, onMove, onDelete, onEdit, showAttribution, boardName, columnId }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [hovered, setHovered] = useState(false);
  const totalWords = wordCount((post.title ?? '') + ' ' + (post.body ?? ''));

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: post.id,
    data: { post, columnId },
  });

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

  const handleDownload = (e) => {
    e.stopPropagation();
    downloadMarkdown(post, boardName);
    setMenuOpen(false);
  };

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
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
      onClick={() => { if (menuOpen || isDragging) return; onEdit(post); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); setMenuOpen(false); }}
      className="rounded-md bg-card p-3.5 cursor-pointer relative transition-shadow duration-150"
      style={{
        border: '1px solid hsl(var(--border) / 0.5)',
        boxShadow: hovered ? '0 2px 8px hsl(var(--foreground) / 0.06)' : '0 1px 3px hsl(var(--foreground) / 0.04)',
        opacity: isDragging ? 0.3 : 1,
      }}
    >
      {/* Three-dot menu (top-right, absolute) */}
      <div className="absolute top-3 right-3">
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
            className="absolute right-0 top-full z-50 bg-card rounded-md p-1 min-w-[160px] font-sans text-xs mt-1"
            style={{
              boxShadow: '0 4px 16px hsl(var(--foreground) / 0.08)',
            }}
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

            <button
              onClick={handleDownload}
              className="flex items-center w-full px-2 py-1.5 bg-transparent border-none cursor-pointer text-foreground rounded-sm text-xs font-sans text-left transition-colors duration-100 hover:bg-accent"
            >
              <Download size={12} className="mr-1.5" />
              Download .md
            </button>

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

      {/* Title (hero element) */}
      <p className="text-base font-bold font-serif text-foreground leading-[1.4] mb-2 pr-6">
        {post.title}
      </p>

      {/* Metadata row: word count + author (supporting info) */}
      {columnId !== 'ideas' && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-sans text-muted-foreground/70">
            {totalWords} {totalWords === 1 ? 'word' : 'words'}
          </span>

          {/* Show creator on shared boards */}
          {showAttribution && post.creator && post.creator[0] && (
            <>
              <span className="text-[10px] text-muted-foreground/40">•</span>
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-[7px] font-sans font-bold text-primary/80">
                    {getInitials(post.creator[0].email)}
                  </span>
                </div>
                <span className="text-[10px] font-sans text-muted-foreground/70">
                  {post.creator[0].email?.split('@')[0] || 'Unknown'}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Body preview */}
      {columnId !== 'ideas' && post.body && (
        <p className="text-xs font-serif text-muted-foreground leading-relaxed overflow-hidden mb-2.5 line-clamp-3">
          {post.body}
        </p>
      )}

      {/* Bottom row: timestamp */}
      <div className="flex items-center">
        <span className="text-[11px] text-muted-foreground font-sans">
          {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
        </span>
      </div>
    </motion.div>
  );
}
