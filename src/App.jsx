import { useState, useEffect } from 'react';
import { useKanban } from './hooks/useKanban';
import { useLinkedIn } from './hooks/useLinkedIn';
import { useCoach } from './hooks/useCoach';
import AppShell from './components/AppShell';
import Board from './components/Board';
import WritingView from './components/WritingView';
import AccountsPanel from './components/AccountsPanel';
import PublishModal from './components/PublishModal';
import CoachingModal from './components/CoachingModal';
import { FONTS, COLUMN_LABELS } from './lib/constants';
import './index.css';

function idleDays(updatedAt) {
  return Math.floor((Date.now() - new Date(updatedAt)) / 86400000);
}

function nudgeReason(tier, post) {
  if (tier === 'finalized-stuck') return 'Ready to publish';
  const days = idleDays(post.updatedAt);
  return `${days} day${days !== 1 ? 's' : ''} idle`;
}

export default function App() {
  const { posts, createPost, updatePost, movePost, deletePost } = useKanban();
  const linkedin = useLinkedIn();
  const { staleCards, topNudges, getTier, snooze, clearSnooze } = useCoach(posts);
  const [view, setView] = useState('board');
  const [editingPost, setEditingPost] = useState(null);
  const [pendingColumn, setPendingColumn] = useState('ideas');
  const [publishTarget, setPublishTarget] = useState(null);
  const [coachingPost, setCoachingPost] = useState(null);
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

  const handleDeletePost = (id) => {
    clearSnooze(id);
    deletePost(id);
  };

  const handleMoveToDraft = (id) => {
    movePost(id, 'drafts');
    clearSnooze(id);
  };

  // Coach nudge sidebar slot
  const coachSlot = topNudges.length > 0 ? (
    <div style={{
      marginTop: '20px', paddingTop: '16px',
      borderTop: '1px solid hsl(var(--sidebar-border))',
    }}>
      <p style={{
        fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#D4A853',
        marginBottom: '8px', fontFamily: FONTS.inter,
      }}>
        Coach
      </p>
      {topNudges.map(({ post, tier }) => (
        <button
          key={post.id}
          onClick={() => setCoachingPost(post)}
          style={{
            width: '100%', textAlign: 'left',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px 8px', borderRadius: 'var(--radius-md)',
            marginBottom: '2px', fontFamily: FONTS.inter,
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--accent))'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
        >
          <p style={{
            fontSize: '12px', fontWeight: 500,
            color: 'hsl(var(--foreground))',
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
            maxWidth: '180px',
          }}>
            {post.title}
          </p>
          <p style={{ fontSize: '10px', color: '#D4A853' }}>
            {nudgeReason(tier, post)}
          </p>
        </button>
      ))}
    </div>
  ) : null;

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
      coachSlot={coachSlot}
    >
      <main style={{ flex: 1, padding: '32px 36px', overflow: 'hidden' }}>
        <Board
          posts={posts}
          onMovePost={movePost}
          onDeletePost={handleDeletePost}
          onNewPost={handleNewPost}
          onEditPost={handleEditPost}
          onPublish={handlePublishRequest}
          linkedin={linkedin}
          getTier={getTier}
          onCoach={setCoachingPost}
          staleCount={staleCards.length}
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
      {coachingPost && (
        <CoachingModal
          post={coachingPost}
          onClose={() => setCoachingPost(null)}
          onOpenEditor={(post) => { setCoachingPost(null); handleEditPost(post); }}
          onMoveToDraft={handleMoveToDraft}
          onSnooze={snooze}
        />
      )}
    </AppShell>
  );
}
