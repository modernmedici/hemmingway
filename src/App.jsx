import { useState } from 'react';
import { useKanban } from './hooks/useKanban';
import Board from './components/Board';
import WritingView from './components/WritingView';
import './index.css';

export default function App() {
  const { posts, createPost, updatePost, movePost, deletePost } = useKanban();
  const [view, setView] = useState('board'); // 'board' | 'editor'
  const [editingPost, setEditingPost] = useState(null);
  const [pendingColumn, setPendingColumn] = useState('ideas');

  const handleNewPost = (columnId) => {
    setEditingPost(null);
    setPendingColumn(columnId);
    setView('editor');
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPendingColumn(post.column);
    setView('editor');
  };

  const handleSave = (title, body, column) => {
    if (editingPost) {
      updatePost(editingPost.id, { title, body });
      if (column !== editingPost.column) {
        movePost(editingPost.id, column);
      }
    } else {
      createPost(title, body, column);
    }
    setView('board');
  };

  const handleCancel = () => {
    setView('board');
  };

  if (view === 'editor') {
    return (
      <WritingView
        post={editingPost}
        defaultColumn={pendingColumn}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fff', fontFamily: "'IBM Plex Mono', monospace" }}>
      <header style={{ borderBottom: '1px solid #e5e5e5', padding: '20px 32px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '0.15em', color: '#111', fontFamily: "'IBM Plex Mono', monospace" }}>
          Hemingway
        </h1>
        <p style={{ marginTop: '2px', fontSize: '11px', letterSpacing: '0.12em', color: '#aaa', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace" }}>
          Write. Draft. Publish.
        </p>
      </header>

      <main style={{ flex: 1, padding: '32px', overflow: 'hidden' }}>
        <Board
          posts={posts}
          onMovePost={movePost}
          onDeletePost={deletePost}
          onNewPost={handleNewPost}
          onEditPost={handleEditPost}
        />
      </main>
    </div>
  );
}
