import { useState, useRef, useEffect } from 'react';

export default function NewPostForm({ onCreate, onCancel }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title, body);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="mt-2 rounded-lg border border-stone-200 bg-white p-3 shadow-sm"
    >
      <input
        ref={titleRef}
        type="text"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-sm font-medium text-stone-900 placeholder-stone-300 outline-none"
      />
      <textarea
        placeholder="Body (optional)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="mt-2 w-full resize-none text-sm text-stone-600 placeholder-stone-300 outline-none"
      />
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded px-3 py-1 text-xs font-medium bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Create
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-3 py-1 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
