import { useState, useEffect } from 'react'
import { useKanban } from './hooks/useKanban'
import db from './lib/db'
import { AuthScreen } from './components/AuthScreen'
import AppShell from './components/AppShell'
import Board from './components/Board'
import WritingView from './components/WritingView'
import './index.css'

export default function App() {
  const { user, isLoading: authLoading } = db.useAuth()

  // Handle magic code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code && !user) {
      // InstantDB automatically handles verification when the page loads with a code param
      console.log('Magic code detected:', code)
    }
  }, [user])
  const { posts, loading, error, createPost, updatePost, movePost, deletePost } = useKanban()
  const [view, setView] = useState('board')
  const [editingPost, setEditingPost] = useState(null)
  const [pendingColumn, setPendingColumn] = useState('ideas')

  // Show auth screen if not signed in
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-[var(--text-dim)]">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  const handleNewPost = (columnId) => {
    setEditingPost(null)
    setPendingColumn(columnId)
    setView('editor')
  }

  const handleEditPost = (post) => {
    setEditingPost(post)
    setPendingColumn(post.column)
    setView('editor')
  }

  const handleSave = (title, body, column) => {
    if (editingPost) {
      updatePost(editingPost.id, { title, body })
      if (column !== editingPost.column) movePost(editingPost.id, column)
    } else {
      createPost(title, body, column)
    }
    setView('board')
  }

  if (view === 'editor') {
    return (
      <WritingView
        post={editingPost}
        defaultColumn={pendingColumn}
        onSave={handleSave}
        onCancel={() => setView('board')}
      />
    )
  }

  return (
    <AppShell onNewIdea={() => handleNewPost('ideas')} user={user}>
      <main style={{ flex: 1, padding: '32px 36px', overflow: 'hidden' }}>
        <Board
          posts={posts}
          loading={loading}
          error={error}
          onMovePost={movePost}
          onDeletePost={deletePost}
          onNewPost={handleNewPost}
          onEditPost={handleEditPost}
        />
      </main>
    </AppShell>
  )
}
