import { useCallback } from 'react'
import db from '../lib/db'
import { id } from '@instantdb/react'

export function useKanban() {
  const { user } = db.useAuth()
  const { isLoading, error, data } = db.useQuery(
    user ? { $users: { $: { where: { id: user.id } }, posts: {} } } : null
  )
  const posts = data?.$users?.[0]?.posts ?? []

  const createPost = useCallback(async (title, body, column = 'ideas') => {
    if (!user) return
    const postId = id()
    const now = new Date()
    await db.transact([
      db.tx.posts[postId].create({
        title: title.trim(),
        body: body.trim(),
        column,
        createdAt: now,
        updatedAt: now,
      }),
      db.tx.$users[user.id].link({ posts: postId }),
    ])
    return { id: postId }
  }, [user])

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
    posts,
    loading: isLoading,
    error: error?.message ?? null,
    createPost,
    updatePost,
    movePost,
    deletePost
  }
}
