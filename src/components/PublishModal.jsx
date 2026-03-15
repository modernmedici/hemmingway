import { motion, AnimatePresence } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { FONTS, LINKEDIN } from '../lib/constants';
import LinkedInLogo from './LinkedInLogo';

export default function PublishModal({ post, onConfirm, onCancel, publishing, error }) {
  const preview = `${post.title}\n\n${post.body ?? ''}`.trim();
  const charCount = preview.length;
  const overLimit = charCount > 3000;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'hsl(var(--foreground) / 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}
      >
        <motion.div
          initial={{ scale: 0.96, y: 8 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 8 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            maxWidth: '480px',
            width: '100%',
            fontFamily: FONTS.inter,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LinkedInLogo radius="4px" />
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>Publish to LinkedIn</p>
            </div>
            <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', lineHeight: 0 }}>
              <X size={16} />
            </button>
          </div>

          {/* Preview */}
          <div style={{
            background: 'hsl(var(--secondary))',
            borderRadius: 'var(--radius-md)',
            padding: '16px', marginBottom: '16px',
            fontSize: '13px', fontFamily: FONTS.inter, color: 'hsl(var(--foreground))',
            lineHeight: '1.6', whiteSpace: 'pre-wrap',
            maxHeight: '200px', overflowY: 'auto',
          }}>
            {preview}
          </div>

          {/* Char count */}
          <p style={{ fontSize: '11px', color: overLimit ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))', marginBottom: '20px', textAlign: 'right' }}>
            {charCount} / 3000 characters{overLimit && ' — over limit'}
          </p>

          {error && (
            <p style={{ fontSize: '12px', color: 'hsl(var(--destructive))', marginBottom: '12px', background: 'hsl(var(--destructive) / 0.1)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
              {error}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              onClick={onCancel}
              style={{ fontSize: '13px', fontFamily: FONTS.inter, color: 'hsl(var(--muted-foreground))', background: 'none', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius-sm)', padding: '7px 16px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={overLimit || publishing}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', fontFamily: FONTS.inter, fontWeight: 500,
                background: overLimit || publishing ? 'hsl(var(--muted))' : LINKEDIN.primary,
                color: overLimit || publishing ? 'hsl(var(--muted-foreground))' : '#fff',
                border: 'none', borderRadius: 'var(--radius-sm)',
                padding: '7px 16px', cursor: overLimit || publishing ? 'not-allowed' : 'pointer',
              }}
            >
              <Send size={13} />
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
