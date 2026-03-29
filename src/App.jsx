import { useState } from 'react';
import { useKanban } from './hooks/useKanban';
import { useCoach } from './hooks/useCoach';
import AppShell from './components/AppShell';
import Board from './components/Board';
import WritingView from './components/WritingView';
import CoachingModal from './components/CoachingModal';
import SettingsModal from './components/SettingsModal';
import './index.css';

export default function App() {
  const { posts, loading, error, createPost, updatePost, movePost, deletePost } = useKanban();
  const { getTier, snooze } = useCoach(posts);
  const [view, setView] = useState('board');
  const [editingPost, setEditingPost] = useState(null);
  const [pendingColumn, setPendingColumn] = useState('ideas');
  const [activeCoachPost, setActiveCoachPost] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleNewPost = (columnId) => {
    setActiveCoachPost(null);
    setEditingPost(null);
    setPendingColumn(columnId);
    setView('editor');
  };

  const handleEditPost = (post) => {
    setActiveCoachPost(null);
    setEditingPost(post);
    setPendingColumn(post.column);
    setView('editor');
  };

  const handleCoachPost = (post) => {
    setActiveCoachPost(post);
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
    <AppShell onNewIdea={() => handleNewPost('ideas')} onOpenSettings={() => setShowSettings(true)}>
      <main style={{ flex: 1, padding: '32px 36px', overflow: 'hidden' }}>
        <Board
          posts={posts}
          loading={loading}
          error={error}
          onMovePost={movePost}
          onDeletePost={deletePost}
          onNewPost={handleNewPost}
          onEditPost={handleEditPost}
          onCoachPost={handleCoachPost}
          getTier={getTier}
        />
      </main>

      {activeCoachPost && (
        <CoachingModal
          post={activeCoachPost}
          onClose={() => setActiveCoachPost(null)}
          onSnooze={snooze}
          onMovePost={movePost}
        />
      )}

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </AppShell>
  );
}
