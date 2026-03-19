import { useState } from 'react';
import { useKanban } from './hooks/useKanban';
import AppShell from './components/AppShell';
import Board from './components/Board';
import WritingView from './components/WritingView';
import './index.css';

export default function App() {
  const { posts, loading, createPost, updatePost, movePost, deletePost } = useKanban();
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
    <AppShell onNewIdea={() => handleNewPost('ideas')}>
      <main style={{ flex: 1, padding: '32px 36px', overflow: 'hidden' }}>
        <Board
          posts={posts}
          loading={loading}
          onMovePost={movePost}
          onDeletePost={deletePost}
          onNewPost={handleNewPost}
          onEditPost={handleEditPost}
        />
      </main>
    </AppShell>
  );
}
