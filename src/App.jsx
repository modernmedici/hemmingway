import { useKanban } from './hooks/useKanban';
import Board from './components/Board';
import './index.css';

export default function App() {
  const { posts, createPost, updatePost, movePost, deletePost } = useKanban();

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="px-8 py-6 border-b border-stone-200">
        <h1 className="font-serif text-2xl tracking-widest text-stone-900 select-none">
          Hemingway
        </h1>
        <p className="mt-0.5 text-xs tracking-wider text-stone-400 uppercase">
          Write. Draft. Publish.
        </p>
      </header>

      <main className="flex-1 p-6 overflow-hidden">
        <Board
          posts={posts}
          onCreatePost={createPost}
          onUpdatePost={updatePost}
          onMovePost={movePost}
          onDeletePost={deletePost}
        />
      </main>
    </div>
  );
}
