import { useState, useEffect } from 'react'
import { useKanban } from './hooks/useKanban'
import { useBoards } from './hooks/useBoards'
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
  // Get user's boards
  const { boards, loading: boardsLoading, createBoard, isOwner } = useBoards()

  // Track active board (default to first board)
  const [activeBoardId, setActiveBoardId] = useState(null)

  // Set default active board when boards load
  useEffect(() => {
    if (!activeBoardId && boards.length > 0) {
      setActiveBoardId(boards[0].id)
    }
  }, [boards, activeBoardId])

  // Get posts for the active board
  const { posts, loading, error, createPost, updatePost, movePost, deletePost } = useKanban(activeBoardId)

  const [view, setView] = useState('board')
  const [editingPost, setEditingPost] = useState(null)
  const [pendingColumn, setPendingColumn] = useState('ideas')

  // Handle board selection
  const handleSelectBoard = (boardId) => {
    setActiveBoardId(boardId)
  }

  // Handle board creation
  const handleCreateBoard = async (name) => {
    const result = await createBoard(name)
    if (result?.id) {
      setActiveBoardId(result.id)
    }
  }

  // Show loading screen while auth or boards are loading
  if (authLoading || boardsLoading) {
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
    <AppShell
      onNewIdea={() => handleNewPost('ideas')}
      user={user}
      boards={boards}
      activeBoardId={activeBoardId}
      onSelectBoard={handleSelectBoard}
      onCreateBoard={handleCreateBoard}
      isOwner={isOwner}
    >
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
