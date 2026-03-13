import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trash2, Check, X } from 'lucide-react';

export default function PostCard({ post, onUpdate, onMove, onDelete, isFirst, isLast }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editBody, setEditBody] = useState(post.body);
  const titleRef = useRef(null);

  useEffect(() => {
    if (editing) titleRef.current?.focus();
  }, [editing]);

  const startEdit = () => {
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditing(true);
  };

  const saveEdit = () => {
    if (!editTitle.trim()) return;
    onUpdate(post.id, { title: editTitle.trim(), body: editBody.trim() });
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') cancelEdit();
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveEdit();
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${post.title}"?`)) {
      onDelete(post.id);
    }
  };

  const COLUMNS = ['ideas', 'drafts', 'finalized'];
  const currentIndex = COLUMNS.indexOf(post.column);

  const moveLeft = () => {
    if (currentIndex > 0) onMove(post.id, COLUMNS[currentIndex - 1]);
  };
  const moveRight = () => {
    if (currentIndex < COLUMNS.length - 1) onMove(post.id, COLUMNS[currentIndex + 1]);
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
      {editing ? (
        <div onKeyDown={handleKeyDown}>
          <input
            ref={titleRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full text-sm font-medium text-stone-900 outline-none border-b border-stone-200 pb-1 mb-2"
          />
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={4}
            className="w-full resize-none text-sm text-stone-600 outline-none"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={saveEdit}
              disabled={!editTitle.trim()}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Check size={12} />
              Save
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-stone-400 hover:text-stone-900 transition-colors"
            >
              <X size={12} />
              Cancel
            </button>
            <span className="ml-auto text-xs text-stone-300">⌘↵ to save · Esc to cancel</span>
          </div>
        </div>
      ) : (
        <>
          <button
            onClick={startEdit}
            className="w-full text-left"
          >
            <p className="text-sm font-medium text-stone-900 hover:text-stone-600 transition-colors">
              {post.title}
            </p>
            {post.body && (
              <p className="mt-1 text-xs text-stone-400 line-clamp-2 leading-relaxed">
                {post.body}
              </p>
            )}
          </button>
          <div className="mt-2 flex items-center gap-1">
            <button
              onClick={moveLeft}
              disabled={isFirst}
              title="Move left"
              className="p-1 rounded text-stone-300 hover:text-stone-900 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={moveRight}
              disabled={isLast}
              title="Move right"
              className="p-1 rounded text-stone-300 hover:text-stone-900 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={handleDelete}
              title="Delete"
              className="ml-auto p-1 rounded text-stone-300 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
