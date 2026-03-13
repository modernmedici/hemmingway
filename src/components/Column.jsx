import PostCard from './PostCard';
import NewPostForm from './NewPostForm';

export default function Column({
  column,
  posts,
  onCreatePost,
  onUpdatePost,
  onMovePost,
  onDeletePost,
  showNewForm,
  onShowNewForm,
  onHideNewForm,
}) {
  const COLUMNS = ['ideas', 'drafts', 'finalized'];
  const colIndex = COLUMNS.indexOf(column.id);

  return (
    <div className="flex flex-col bg-stone-100 rounded-xl p-3 min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xs font-semibold tracking-widest uppercase text-stone-500">
          {column.label}
        </h2>
        <span className="text-xs text-stone-400 tabular-nums">
          {posts.length > 0 ? posts.length : ''}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-12rem)] space-y-2 pr-0.5">
        {posts.length === 0 && !showNewForm && (
          <p className="text-xs italic text-stone-300 px-1 pt-2">Nothing here yet.</p>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onUpdate={onUpdatePost}
            onMove={onMovePost}
            onDelete={onDeletePost}
            isFirst={colIndex === 0}
            isLast={colIndex === COLUMNS.length - 1}
          />
        ))}
        {showNewForm && (
          <NewPostForm
            onCreate={(title, body) => {
              onCreatePost(title, body, column.id);
              onHideNewForm();
            }}
            onCancel={onHideNewForm}
          />
        )}
      </div>

      {/* Footer */}
      {!showNewForm && (
        <button
          onClick={onShowNewForm}
          className="mt-3 w-full rounded-lg border border-dashed border-stone-300 py-2 text-xs text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-colors"
        >
          + New post
        </button>
      )}
    </div>
  );
}
