import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, MoreHorizontal, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { COLUMN_IDS, COLUMN_LABELS, FONTS, LINKEDIN } from '../lib/constants';
import { idleDays } from '../lib/utils';

const wordCount = (text) => {
  const trimmed = text?.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
};

function staleBorderStyle(tier) {
  if (tier === 'mild') {
    return {
      border: '1px solid #E5C97E',
      background: '#FFFDF4',
    };
  }
  if (tier === 'urgent') {
    return {
      border: '1px solid #D4A853',
      background: '#FFFDF4',
      boxShadow: '0 0 0 3px rgba(212,168,83,0.20)',
    };
  }
  if (tier === 'finalized-stuck') {
    return {
      border: '1px solid #D4A853',
      background: '#FFFDF4',
    };
  }
  return {};
}

export default function PostCard({ post, onMove, onDelete, onEdit, onPublish, linkedin, stalenessTier, onCoach }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [hovered, setHovered] = useState(false);
  const totalWords = wordCount((post.title ?? '') + ' ' + (post.body ?? ''));
  const isFinalized = post.column === 'finalized';
  const isPublished = post.publishedTo?.includes('linkedin');
  const isStale = stalenessTier != null;
  const days = idleDays(post.updatedAt);

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

  const handlePublish = async (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    await onPublish(post);
  };

  const handleCardClick = () => {
    if (menuOpen) return;
    if (isStale && onCoach) {
      onCoach(post);
    } else {
      onEdit(post);
    }
  };

  const baseStyle = {
    border: '1px solid hsl(var(--border) / 0.5)',
    borderRadius: 'var(--radius-md)',
    background: 'hsl(var(--card))',
    padding: '14px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'box-shadow 0.15s',
    boxShadow: hovered && !isStale ? '0 2px 8px hsl(var(--foreground) / 0.06)' : 'none',
  };

  const cardStyle = isStale
    ? { ...baseStyle, ...staleBorderStyle(stalenessTier) }
    : baseStyle;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); }}
      style={cardStyle}
    >
      {/* Staleness badge (urgent and finalized-stuck only) */}
      {(stalenessTier === 'urgent' || stalenessTier === 'finalized-stuck') && (
        <span style={{
          position: 'absolute', top: '8px', right: '8px',
          background: '#D4A853', color: 'white',
          fontSize: '9px', fontFamily: FONTS.inter, fontWeight: 600,
          padding: '2px 6px', borderRadius: '10px',
        }}>
          {stalenessTier === 'finalized-stuck' ? 'Ready to publish' : `${days} days idle`}
        </span>
      )}

      {/* Top row: word count badge + three-dot menu */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{
          fontSize: '10px', fontFamily: FONTS.inter, fontWeight: 500,
          color: 'hsl(var(--muted-foreground))',
          background: 'hsl(var(--secondary))',
          borderRadius: '999px', padding: '1px 8px',
        }}>
          {totalWords} words
        </span>

        <div style={{ position: 'relative' }}>
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(m => !m); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: hovered ? 'hsl(var(--muted-foreground))' : 'transparent',
              padding: '2px', lineHeight: 0, transition: 'color 0.1s',
              // Offset left to avoid overlap with staleness badge
              marginRight: isStale ? '60px' : '0',
            }}
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute', right: 0, top: '100%', zIndex: 50,
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 16px hsl(var(--foreground) / 0.1)',
                padding: '4px', minWidth: '160px',
                fontFamily: FONTS.inter, fontSize: '12px',
              }}
            >
              {COLUMN_IDS.filter(c => c !== post.column).map(col => (
                <button key={col} onClick={e => handleMove(e, col)} style={menuItemStyle}>
                  Move to {COLUMN_LABELS[col]}
                </button>
              ))}

              {isFinalized && linkedin?.isConnected && !isPublished && (
                <button onClick={handlePublish} style={{ ...menuItemStyle, color: LINKEDIN.primary }}>
                  <Send size={12} style={{ marginRight: '6px' }} />
                  Publish to LinkedIn
                </button>
              )}

              <div style={{ height: '1px', background: 'hsl(var(--border))', margin: '4px 0' }} />

              {confirmDelete ? (
                <div style={{ padding: '4px 8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>Delete?</span>
                  <button onClick={handleDelete} style={{ ...menuItemStyle, color: 'hsl(var(--destructive))', padding: '2px 4px' }}>Yes</button>
                  <button onClick={e => { e.stopPropagation(); setConfirmDelete(false); }} style={{ ...menuItemStyle, padding: '2px 4px' }}>No</button>
                </div>
              ) : (
                <button onClick={handleDelete} style={{ ...menuItemStyle, color: 'hsl(var(--destructive))' }}>
                  <Trash2 size={12} style={{ marginRight: '6px' }} />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <p style={{
        fontSize: '14px', fontWeight: 700, fontFamily: FONTS.serif,
        color: 'hsl(var(--foreground))', lineHeight: '1.4',
        marginBottom: post.body ? '6px' : '10px',
        transition: 'color 0.1s',
      }}>
        {post.title}
      </p>

      {/* Body preview */}
      {post.body && (
        <p style={{
          fontSize: '12px', fontFamily: FONTS.inter,
          color: 'hsl(var(--muted-foreground))', lineHeight: '1.6',
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          marginBottom: '10px',
        }}>
          {post.body}
        </p>
      )}

      {/* Bottom row: timestamp + icon + published badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', fontFamily: FONTS.inter }}>
          {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isPublished && (
            <span style={{
              fontSize: '9px', fontFamily: FONTS.inter, fontWeight: 600,
              color: '#fff', background: LINKEDIN.primary,
              borderRadius: '3px', padding: '2px 6px', letterSpacing: '0.04em',
            }}>
              LinkedIn
            </span>
          )}
          <FileText size={13} color="hsl(var(--muted-foreground))" />
        </div>
      </div>
    </motion.div>
  );
}

const menuItemStyle = {
  display: 'flex', alignItems: 'center',
  width: '100%', padding: '6px 8px',
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'hsl(var(--foreground))',
  borderRadius: 'var(--radius-sm)',
  fontSize: '12px', fontFamily: "'Inter', sans-serif",
  textAlign: 'left', transition: 'background 0.1s',
};
