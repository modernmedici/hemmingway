import { useState } from 'react';
import { useKanban } from './hooks/useKanban';
import Board from './components/Board';
import WritingView from './components/WritingView';
import './index.css';

const mono = "'IBM Plex Mono', monospace";
const serif = "'Playfair Display', Georgia, serif";

export default function App() {
  const { posts, createPost, updatePost, movePost, deletePost } = useKanban();
  const [view, setView] = useState('board');
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
      if (column !== editingPost.column) movePost(editingPost.id, column);
    } else {
      createPost(title, body, column);
    }
    setView('board');
  };

  if (view === 'editor') {
    return (
      <WritingView
        post={editingPost}
        defaultColumn={pendingColumn}
        onSave={handleSave}
        onCancel={() => setView('board')}
      />
    );
  }

  return (
    <div className="view-enter" style={{ minHeight: '100vh', background: '#f7f5f0', display: 'flex', flexDirection: 'column', fontFamily: mono }}>
      <header style={{ padding: '28px 40px 24px', borderBottom: '1px solid #e8e4dd' }}>
        <h1 style={{ fontFamily: serif, fontSize: '28px', fontWeight: 700, color: '#1a1714', letterSpacing: '0.01em', lineHeight: 1 }}>
          Hemingway
        </h1>
        <p style={{ marginTop: '6px', fontSize: '10px', letterSpacing: '0.18em', color: '#b0a99e', textTransform: 'uppercase', fontFamily: mono }}>
          Write · Draft · Publish
        </p>
      </header>

      <main style={{ flex: 1, padding: '36px 40px', overflow: 'hidden' }}>
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
