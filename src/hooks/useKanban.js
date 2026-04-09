import { useCallback } from 'react'
import db from '../lib/db'
import { id } from '@instantdb/react'

export function useKanban() {
  const { isLoading, error, data } = db.useQuery({ posts: {} })
  const posts = data?.posts ?? []

  const createPost = useCallback(async (title, body, column = 'ideas') => {
    const postId = id()
    const now = new Date()
    await db.transact(
      db.tx.posts[postId].create({
        title: title.trim(),
        body: body.trim(),
        column,
        createdAt: now,
        updatedAt: now,
      })
    )
    return { id: postId }
  }, [])

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
