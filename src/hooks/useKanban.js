import { useCallback } from 'react'
import db from '../lib/db'
import { id } from '@instantdb/react'

export function useKanban(boardId) {
  const { user } = db.useAuth()

  // Query the specific board with its posts
  const { isLoading, error, data } = db.useQuery(
    user && boardId
      ? { boards: { $: { where: { id: boardId } }, posts: { creator: {} } } }
      : null
  )

  const posts = data?.boards?.[0]?.posts ?? []
  const board = data?.boards?.[0]

  const createPost = useCallback(async (title, body, column = 'ideas') => {
    if (!user || !boardId) return
    const postId = id()
    const now = new Date()
    await db.transact([
      db.tx.posts[postId].update({
        title: title.trim(),
        body: body.trim(),
        column,
        createdAt: now,
        updatedAt: now,
      }),
      db.tx.posts[postId].link({ creator: user.id, board: boardId }),
    ])
    return { id: postId }
  }, [user, boardId])

  const updatePost = useCallback(async (postId, updates) => {
    const now = new Date()
    await db.transact(
      db.tx.posts[postId].update({
        ...updates,
        updatedAt: now,
      })
    )
  }, [])

  const movePost = useCallback(async (postId, column) => {
    const now = new Date()
    await db.transact(
      db.tx.posts[postId].update({
        column,
        updatedAt: now,
      })
    )
  }, [])

  const deletePost = useCallback(async (postId) => {
    await db.transact(db.tx.posts[postId].delete())
  }, [])

  return {
    board,
    posts,
    loading: isLoading,
    error: error?.message ?? null,
    createPost,
    updatePost,
    movePost,
    deletePost
  }
}
