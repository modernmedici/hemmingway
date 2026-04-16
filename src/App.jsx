import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import { useKanban } from './hooks/useKanban'
import { useBoards } from './hooks/useBoards'
import db from './lib/db'
import { AuthScreen } from './components/AuthScreen'
import AppShell from './components/AppShell'
import Board from './components/Board'
import WritingView from './components/WritingView'
import ShareBoardModal from './components/ShareBoardModal'
import InvitationBanner from './components/InvitationBanner'
import SafariBanner from './components/SafariBanner'
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
  // Get user's boards and invitations
  const {
    boards,
    loading: boardsLoading,
    createBoard,
    isOwner,
    pendingInvitations,
    inviteToBoard,
    acceptInvitation,
    declineInvitation,
  } = useBoards()

  // Track active board (default to first board)
  const [activeBoardId, setActiveBoardId] = useState(null)
  const [creatingDefaultBoard, setCreatingDefaultBoard] = useState(false)

  // Auto-create default board for new users
  useEffect(() => {
    if (user && !boardsLoading && boards.length === 0 && !creatingDefaultBoard) {
      setCreatingDefaultBoard(true)
      createBoard('My Writing').then((result) => {
        if (result?.id) {
          setActiveBoardId(result.id)
        }
        setCreatingDefaultBoard(false)
      })
    }
  }, [user, boards, boardsLoading, creatingDefaultBoard, createBoard])

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
  const [shareModalBoard, setShareModalBoard] = useState(null)

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

  // Handle opening share modal
  const handleShareBoard = (board) => {
    setShareModalBoard(board)
  }

  // Handle sending invitation
  const handleInvite = async (boardId, email, role) => {
    await inviteToBoard(boardId, email, role)
  }

  // Handle accepting invitation
  const handleAcceptInvitation = async (invitationId, boardId) => {
    await acceptInvitation(invitationId, boardId)
    // Switch to the newly joined board
    setActiveBoardId(boardId)
  }

  // Handle declining invitation
  const handleDeclineInvitation = async (invitationId) => {
    await declineInvitation(invitationId)
  }

  // Show loading screen while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-[var(--text-dim)]">Loading...</div>
      </div>
    )
  }

  // Show auth screen if no user (don't wait for boards when logged out)
  if (!user) {
    return <AuthScreen />
  }

  // Show loading screen while boards are loading (only when user exists)
  if (boardsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-[var(--text-dim)]">Loading...</div>
      </div>
    )
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

  const activeBoard = boards.find(b => b.id === activeBoardId)

  return (
    <>
      <AppShell
        onNewIdea={() => handleNewPost('ideas')}
        user={user}
        boards={boards}
        activeBoardId={activeBoardId}
        onSelectBoard={handleSelectBoard}
        onCreateBoard={handleCreateBoard}
        isOwner={isOwner}
        pendingInvitations={pendingInvitations}
        onAcceptInvitation={handleAcceptInvitation}
        onDeclineInvitation={handleDeclineInvitation}
        posts={posts}
      >

        <main style={{ flex: 1, padding: '32px 36px', overflow: 'hidden' }}>
          <Board
            board={activeBoard}
            posts={posts}
            loading={loading}
            error={error}
            onMovePost={movePost}
            onDeletePost={deletePost}
            onNewPost={handleNewPost}
            onEditPost={handleEditPost}
            onShareBoard={handleShareBoard}
            isOwner={isOwner}
            currentUser={user}
          />
        </main>
      </AppShell>
      <AnimatePresence mode="wait">
        {view === 'editor' ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <WritingView
              post={editingPost}
              defaultColumn={pendingColumn}
              onSave={handleSave}
              onCancel={() => setView('board')}
              currentUser={user}
            />
          </motion.div>
        ) : (
          <motion.div
            key="board"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <SafariBanner />
            <AppShell
              onNewIdea={() => handleNewPost('ideas')}
              user={user}
              boards={boards}
              activeBoardId={activeBoardId}
              onSelectBoard={handleSelectBoard}
              onCreateBoard={handleCreateBoard}
              isOwner={isOwner}
              pendingInvitations={pendingInvitations}
              onAcceptInvitation={handleAcceptInvitation}
              onDeclineInvitation={handleDeclineInvitation}
            >

              <main style={{ flex: 1, padding: '32px 36px', overflow: 'hidden' }}>
                <Board
                  board={activeBoard}
                  posts={posts}
                  loading={loading}
                  error={error}
                  onMovePost={movePost}
                  onDeletePost={deletePost}
                  onNewPost={handleNewPost}
                  onEditPost={handleEditPost}
                  onShareBoard={handleShareBoard}
                  isOwner={isOwner}
                  currentUser={user}
                />
              </main>
            </AppShell>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share board modal */}
      {shareModalBoard && (
        <ShareBoardModal
          board={shareModalBoard}
          onClose={() => setShareModalBoard(null)}
          onInvite={handleInvite}
        />
      )}

      {/* Vercel Web Analytics */}
      <Analytics />
    </>
  )
}
