import { useCallback, useMemo } from 'react'
import db from '../lib/db'
import { id } from '@instantdb/react'

// Helper: wrap database operations with consistent error handling
const wrapDbOperation = (actionLabel) => async (operation) => {
  try {
    return await operation();
  } catch (error) {
    console.error(`Failed to ${actionLabel}:`, error);
    throw new Error(`Failed to ${actionLabel}. Check your connection and try again.`);
  }
};

export function useKanban(boardId) {
  const { user } = db.useAuth()

  // Query the specific board with its posts and members
  const { isLoading, error, data } = db.useQuery(
    user && boardId
      ? { boards: { $: { where: { id: boardId } }, posts: { creator: {} }, members: {}, owner: {} } }
      : null
  )

  const posts = useMemo(
    () => (data?.boards?.[0]?.posts ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [data?.boards]
  )
  const board = data?.boards?.[0]

  const createPost = useCallback(async (title, body, column = 'ideas') => {
    if (!user || !boardId) return
    const postId = id()
    const now = new Date()
    // Assign order as max + 1 for the column
    const columnPosts = posts.filter(p => p.column === column)
    const maxOrder = columnPosts.length > 0 ? Math.max(...columnPosts.map(p => p.order ?? 0)) : 0

    return await wrapDbOperation('create post')(async () => {
      await db.transact([
        db.tx.posts[postId].update({
          title: title.trim(),
          body: body.trim(),
          column,
          createdAt: now,
          updatedAt: now,
          order: maxOrder + 1,
        }),
        db.tx.posts[postId].link({ creator: user.id, board: boardId }),
      ])
      return { id: postId }
    });
  }, [user, boardId, posts])

  const updatePost = useCallback(async (postId, updates) => {
    const now = new Date()
    return await wrapDbOperation('update post')(async () => {
      await db.transact(
        db.tx.posts[postId].update({
          ...updates,
          updatedAt: now,
        })
      )
    });
  }, [])

  const movePost = useCallback(async (postId, targetColumn, targetIndex) => {
    const now = new Date()
    const post = posts.find(p => p.id === postId)
    if (!post) return

    return await wrapDbOperation('move card')(async () => {
      // If no targetIndex provided (old behavior), append to end
      if (targetIndex === undefined) {
        const columnPosts = posts.filter(p => p.column === targetColumn && p.id !== postId)
        const maxOrder = columnPosts.length > 0 ? Math.max(...columnPosts.map(p => p.order ?? 0)) : 0
        await db.transact(
          db.tx.posts[postId].update({
            column: targetColumn,
            order: maxOrder + 1,
            updatedAt: now,
          })
        )
        return
      }

      // Position-aware reordering
      const targetPosts = posts.filter(p => p.column === targetColumn && p.id !== postId)
      const transactions = []

      // Insert at targetIndex
      targetPosts.splice(targetIndex, 0, { ...post, column: targetColumn })

      // Recalculate orders for all posts in target column
      targetPosts.forEach((p, idx) => {
        const update = {
          column: targetColumn,
          order: idx,
        }

        // Column change = progress, update timestamp for the moved card only
        if (p.id === postId && post.column !== targetColumn) {
          update.updatedAt = now
        }

        transactions.push(db.tx.posts[p.id].update(update))
      })

      // If source column changed, reorder source column too
      if (post.column !== targetColumn) {
        const sourcePosts = posts.filter(p => p.column === post.column && p.id !== postId)
        sourcePosts.forEach((p, idx) => {
          transactions.push(
            db.tx.posts[p.id].update({
              order: idx,
            })
          )
        })
      }

      await db.transact(transactions)
    });
  }, [posts])

  const deletePost = useCallback(async (postId) => {
    return await wrapDbOperation('delete post')(async () => {
      await db.transact(db.tx.posts[postId].delete())
    });
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
