import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

const wordCount = (text) => {
  const trimmed = text?.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
};

export default function DragOverlayCard({ post, columnId }) {
  const totalWords = wordCount((post.title ?? '') + ' ' + (post.body ?? ''));

  return (
    <div
      className="rounded-md bg-card p-3.5 cursor-grabbing relative"
      style={{
        border: '1px solid hsl(var(--border) / 0.5)',
        boxShadow: '0 12px 28px hsl(var(--foreground) / 0.15)',
        transform: 'rotate(2deg)',
      }}
    >
      {/* Title */}
      <p className="text-base font-bold font-serif text-foreground leading-[1.4] mb-2">
        {post.title}
      </p>

      {/* Metadata row: word count */}
      {columnId !== 'ideas' && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-sans text-muted-foreground/70">
            {totalWords} {totalWords === 1 ? 'word' : 'words'}
          </span>
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
    </div>
  );
}
