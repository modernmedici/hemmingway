import { useState, useEffect } from 'react';
import { useKanban } from './hooks/useKanban';
import { useLinkedIn } from './hooks/useLinkedIn';
import AppShell from './components/AppShell';
import Board from './components/Board';
import WritingView from './components/WritingView';
import AccountsPanel from './components/AccountsPanel';
import PublishModal from './components/PublishModal';
import './index.css';

export default function App() {
  const { posts, createPost, updatePost, movePost, deletePost } = useKanban();
  const linkedin = useLinkedIn();
  const [view, setView] = useState('board');
  const [editingPost, setEditingPost] = useState(null);
  const [pendingColumn, setPendingColumn] = useState('ideas');
  const [publishTarget, setPublishTarget] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('hemingway-dark') === 'true';
  });

  // Apply dark class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('hemingway-dark', isDark);
  }, [isDark]);

  // Detect LinkedIn OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('linkedin_token');
    const error = params.get('linkedin_error');
    if (token) linkedin.receiveToken(token);
    if (error) console.error('[LinkedIn] OAuth error:', error);
    if (token || error) window.history.replaceState({}, '', window.location.pathname);
  }, []);

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

  const handlePublishRequest = (post) => setPublishTarget(post);

  const handlePublishConfirm = async () => {
    try {
      await linkedin.publishPost(publishTarget.title, publishTarget.body);
      updatePost(publishTarget.id, { publishedTo: ['linkedin'] });
      setPublishTarget(null);
    } catch { /* error shown in modal via linkedin.publishError */ }
  };

  if (view === 'editor') {
    return (
      <WritingView
        post={editingPost}
        defaultColumn={pendingColumn}
        onSave={handleSave}
        onCancel={() => setView('board')}
        linkedin={linkedin}
        onPublish={handlePublishRequest}
      />
    );
  }

  return (
    <AppShell
      onNewIdea={() => handleNewPost('ideas')}
      onToggleDark={() => setIsDark(d => !d)}
      isDark={isDark}
      linkedinSlot={<AccountsPanel linkedin={linkedin} />}
    >
      <main style={{ flex: 1, padding: '32px 36px', overflow: 'hidden' }}>
        <Board
          posts={posts}
          onMovePost={movePost}
          onDeletePost={deletePost}
          onNewPost={handleNewPost}
          onEditPost={handleEditPost}
          onPublish={handlePublishRequest}
          linkedin={linkedin}
        />
      </main>
      {publishTarget && (
        <PublishModal
          post={publishTarget}
          onConfirm={handlePublishConfirm}
          onCancel={() => setPublishTarget(null)}
          publishing={linkedin.publishing}
          error={linkedin.publishError}
        />
      )}
    </AppShell>
  );
}
