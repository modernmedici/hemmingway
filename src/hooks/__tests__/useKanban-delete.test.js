import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useKanban } from '../useKanban'

// Mock the db module
vi.mock('../../lib/db', () => ({
  default: {
    useAuth: vi.fn(() => ({ user: { id: 'user-1' } })),
    useQuery: vi.fn(),
    transact: vi.fn(),
    tx: {
      posts: {}
    }
  }
}))

describe('useKanban deletePost', () => {
  let mockDb

  beforeEach(() => {
    mockDb = require('../../lib/db').default
    vi.clearAllMocks()
  })

  it('logs post data before attempting delete', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const mockPosts = [
      {
        id: 'post-1',
        title: 'Test Post',
        column: 'ideas',
        creator: [{ id: 'user-1' }],
        board: { id: 'board-1' }
      }
    ]

    mockDb.useQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        boards: [{
          id: 'board-1',
          name: 'Test Board',
          posts: mockPosts,
          members: [],
          owner: { id: 'user-1' }
        }]
      }
    })

    mockDb.transact.mockResolvedValue(undefined)

    const { result } = renderHook(() => useKanban('board-1'))

    await waitFor(() => {
      expect(result.current.posts).toHaveLength(1)
    })

    // Attempt delete
    await result.current.deletePost('post-1')

    // Should log post data
    expect(consoleSpy).toHaveBeenCalledWith(
      '[DELETE] Post data:',
      expect.objectContaining({
        id: 'post-1',
        column: 'ideas',
        hasCreator: true,
        hasBoard: true,
        userId: 'user-1',
        boardId: 'board-1'
      })
    )

    consoleSpy.mockRestore()
  })

  it('detects missing creator relationship on old posts', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const oldPostWithoutCreator = {
      id: 'post-old',
      title: 'Old Post',
      column: 'ideas',
      creator: [], // Empty - missing relationship
      board: { id: 'board-1' }
    }

    mockDb.useQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        boards: [{
          id: 'board-1',
          posts: [oldPostWithoutCreator],
          members: [],
          owner: { id: 'user-1' }
        }]
      }
    })

    const { result } = renderHook(() => useKanban('board-1'))

    await waitFor(() => {
      expect(result.current.posts).toHaveLength(1)
    })

    await result.current.deletePost('post-old')

    // Should detect missing creator
    expect(consoleSpy).toHaveBeenCalledWith(
      '[DELETE] Post data:',
      expect.objectContaining({
        id: 'post-old',
        hasCreator: false,
        creatorArray: []
      })
    )

    consoleSpy.mockRestore()
  })

  it('detects missing board relationship', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const postWithoutBoard = {
      id: 'post-no-board',
      title: 'Post',
      column: 'ideas',
      creator: [{ id: 'user-1' }],
      board: undefined // Missing board relationship
    }

    mockDb.useQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        boards: [{
          id: 'board-1',
          posts: [postWithoutBoard],
          members: [],
          owner: { id: 'user-1' }
        }]
      }
    })

    const { result } = renderHook(() => useKanban('board-1'))

    await waitFor(() => {
      expect(result.current.posts).toHaveLength(1)
    })

    await result.current.deletePost('post-no-board')

    expect(consoleSpy).toHaveBeenCalledWith(
      '[DELETE] Post data:',
      expect.objectContaining({
        id: 'post-no-board',
        hasBoard: false,
        boardData: undefined
      })
    )

    consoleSpy.mockRestore()
  })

  it('successfully deletes post with all relationships', async () => {
    const validPost = {
      id: 'post-valid',
      title: 'Valid Post',
      column: 'ideas',
      creator: [{ id: 'user-1' }],
      board: { id: 'board-1' }
    }

    mockDb.useQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        boards: [{
          id: 'board-1',
          posts: [validPost],
          members: [],
          owner: { id: 'user-1' }
        }]
      }
    })

    mockDb.tx.posts = {
      'post-valid': {
        delete: vi.fn(() => ({ type: 'delete', id: 'post-valid' }))
      }
    }
    mockDb.transact.mockResolvedValue(undefined)

    const { result } = renderHook(() => useKanban('board-1'))

    await waitFor(() => {
      expect(result.current.posts).toHaveLength(1)
    })

    await result.current.deletePost('post-valid')

    // Should call transact with delete transaction
    expect(mockDb.transact).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'delete', id: 'post-valid' })
    )
  })

  it('throws error wrapped by wrapDbOperation on failure', async () => {
    const postToDelete = {
      id: 'post-fail',
      title: 'Post',
      column: 'ideas',
      creator: [],
      board: { id: 'board-1' }
    }

    mockDb.useQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        boards: [{
          id: 'board-1',
          posts: [postToDelete],
          members: [],
          owner: { id: 'user-1' }
        }]
      }
    })

    mockDb.transact.mockRejectedValue(new Error('Permission denied'))

    const { result } = renderHook(() => useKanban('board-1'))

    await waitFor(() => {
      expect(result.current.posts).toHaveLength(1)
    })

    // Should throw wrapped error
    await expect(result.current.deletePost('post-fail')).rejects.toThrow(
      'Failed to delete post. Check your connection and try again.'
    )
  })
})
