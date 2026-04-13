import { useCallback } from 'react'
import db from '../lib/db'
import { id } from '@instantdb/react'

/**
 * Hook for managing boards and invitations
 * Provides CRUD operations for collaborative boards
 */
export function useBoards() {
  const { user } = db.useAuth()

  // Query boards the user owns or is a member of
  const { isLoading, error, data } = db.useQuery(
    user
      ? {
          $users: {
            $: { where: { id: user.id } },
            ownedBoards: {},
            memberBoards: {},
            sentInvitations: { board: {} },
          },
        }
      : null
  )

  const userData = data?.$users?.[0]
  const ownedBoards = userData?.ownedBoards ?? []
  const memberBoards = userData?.memberBoards ?? []
  const sentInvitations = userData?.sentInvitations ?? []

  // Combine owned and member boards
  const allBoards = [...ownedBoards, ...memberBoards]

  // Query pending invitations for this user
  const { data: invitationData } = db.useQuery(
    user
      ? {
          invitations: {
            $: {
              where: {
                email: user.email,
                status: 'pending',
              },
            },
            board: { owner: {} },
            inviter: {},
          },
        }
      : null
  )

  const pendingInvitations = invitationData?.invitations ?? []

  /**
   * Create a new board
   * @param {string} name - Board name
   * @returns {Promise<{id: string}>} - Created board ID
   */
  const createBoard = useCallback(
    async (name) => {
      if (!user) return

      const boardId = id()
      const now = new Date()

      await db.transact([
        db.tx.boards[boardId].update({
          name: name.trim(),
          createdAt: now,
          updatedAt: now,
        }),
        db.tx.boards[boardId].link({ owner: user.id }),
      ])

      return { id: boardId }
    },
    [user]
  )

  /**
   * Update board name
   * @param {string} boardId - Board ID
   * @param {string} name - New board name
   */
  const updateBoard = useCallback(async (boardId, name) => {
    const now = new Date()
    await db.transact(
      db.tx.boards[boardId].update({
        name: name.trim(),
        updatedAt: now,
      })
    )
  }, [])

  /**
   * Delete a board (owner only)
   * @param {string} boardId - Board ID to delete
   */
  const deleteBoard = useCallback(async (boardId) => {
    await db.transact(db.tx.boards[boardId].delete())
  }, [])

  /**
   * Invite a user to a board
   * @param {string} boardId - Board ID
   * @param {string} email - Invitee email
   * @param {string} role - "editor" | "viewer"
   * @returns {Promise<{id: string}>} - Created invitation ID
   */
  const inviteToBoard = useCallback(
    async (boardId, email, role = 'editor') => {
      if (!user) return

      const invitationId = id()
      const now = new Date()

      await db.transact([
        db.tx.invitations[invitationId].update({
          email: email.trim().toLowerCase(),
          role,
          status: 'pending',
          createdAt: now,
        }),
        db.tx.invitations[invitationId].link({
          board: boardId,
          inviter: user.id,
        }),
      ])

      return { id: invitationId }
    },
    [user]
  )

  /**
   * Accept an invitation
   * @param {string} invitationId - Invitation ID
   * @param {string} boardId - Board ID to join
   */
  const acceptInvitation = useCallback(
    async (invitationId, boardId) => {
      if (!user) return

      await db.transact([
        // Update invitation status
        db.tx.invitations[invitationId].update({ status: 'accepted' }),
        // Add user as board member
        db.tx.boards[boardId].link({ members: user.id }),
      ])
    },
    [user]
  )

  /**
   * Decline an invitation
   * @param {string} invitationId - Invitation ID
   */
  const declineInvitation = useCallback(async (invitationId) => {
    await db.transact(
      db.tx.invitations[invitationId].update({ status: 'declined' })
    )
  }, [])

  /**
   * Leave a board (remove self from members)
   * @param {string} boardId - Board ID to leave
   */
  const leaveBoard = useCallback(
    async (boardId) => {
      if (!user) return

      await db.transact(db.tx.boards[boardId].unlink({ members: user.id }))
    },
    [user]
  )

  /**
   * Cancel an invitation (delete it)
   * @param {string} invitationId - Invitation ID
   */
  const cancelInvitation = useCallback(async (invitationId) => {
    await db.transact(db.tx.invitations[invitationId].delete())
  }, [])

  /**
   * Check if current user is owner of a board
   * @param {string} boardId - Board ID
   * @returns {boolean}
   */
  const isOwner = useCallback(
    (boardId) => {
      return ownedBoards.some((b) => b.id === boardId)
    },
    [ownedBoards]
  )

  /**
   * Check if current user is member of a board
   * @param {string} boardId - Board ID
   * @returns {boolean}
   */
  const isMember = useCallback(
    (boardId) => {
      return memberBoards.some((b) => b.id === boardId)
    },
    [memberBoards]
  )

  return {
    boards: allBoards,
    ownedBoards,
    memberBoards,
    pendingInvitations,
    sentInvitations,
    loading: isLoading,
    error: error?.message ?? null,
    createBoard,
    updateBoard,
    deleteBoard,
    inviteToBoard,
    acceptInvitation,
    declineInvitation,
    leaveBoard,
    cancelInvitation,
    isOwner,
    isMember,
  }
}
