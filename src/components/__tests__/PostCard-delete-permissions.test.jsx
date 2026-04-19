import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostCard from '../PostCard'
import { DndWrapper } from '../../test/dnd-wrapper'

describe('PostCard delete with permission issues', () => {
  let mockOnDelete, mockOnEdit, mockOnMove
  let user

  beforeEach(() => {
    mockOnDelete = vi.fn()
    mockOnEdit = vi.fn()
    mockOnMove = vi.fn()
    user = userEvent.setup()
  })

  const renderCard = (post, onDelete = mockOnDelete) => {
    return render(
      <DndWrapper items={[post.id]}>
        <PostCard
          post={post}
          onDelete={onDelete}
          onEdit={mockOnEdit}
          onMove={mockOnMove}
          showAttribution={false}
          boardName="My Board"
          columnId="ideas"
        />
      </DndWrapper>
    )
  }

  it('successfully deletes post with creator relationship', async () => {
    const postWithCreator = {
      id: 'post-new',
      title: 'New Post',
      body: 'Has creator link',
      column: 'ideas',
      createdAt: new Date('2026-04-19'),
      updatedAt: new Date('2026-04-19'),
      creator: [{ id: 'user-1', email: 'test@example.com' }],
      board: { id: 'board-1' }
    }

    mockOnDelete.mockResolvedValue(undefined)
    renderCard(postWithCreator)

    const card = screen.getByText('New Post').closest('.rounded-md')
    fireEvent.mouseEnter(card)

    const menuButton = screen.getAllByRole('button')[0]
    await user.click(menuButton)

    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    const yesButton = screen.getByText('Yes')
    await user.click(yesButton)

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('post-new')
    })
  })

  it('fails to delete post without creator relationship', async () => {
    const postWithoutCreator = {
      id: 'post-old',
      title: 'Old Post',
      body: 'Missing creator link',
      column: 'ideas',
      createdAt: new Date('2026-04-01'),
      updatedAt: new Date('2026-04-01'),
      creator: [], // Empty creator array (old post issue)
      board: { id: 'board-1' }
    }

    // Simulate permission error from InstantDB
    const permissionError = new Error('Insufficient permissions: creator relationship missing')
    mockOnDelete.mockRejectedValue(permissionError)

    renderCard(postWithoutCreator)

    const card = screen.getByText('Old Post').closest('.rounded-md')
    fireEvent.mouseEnter(card)

    const menuButton = screen.getAllByRole('button')[0]
    await user.click(menuButton)

    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    const yesButton = screen.getByText('Yes')
    await user.click(yesButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Insufficient permissions/i)).toBeInTheDocument()
    })

    // Should reset confirmation state
    expect(screen.queryByText('Delete?')).not.toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('fails to delete post without board relationship', async () => {
    const postWithoutBoard = {
      id: 'post-no-board',
      title: 'Post Without Board',
      body: 'Missing board link',
      column: 'ideas',
      createdAt: new Date('2026-04-01'),
      updatedAt: new Date('2026-04-01'),
      creator: [{ id: 'user-1', email: 'test@example.com' }],
      board: undefined // Missing board relationship
    }

    const permissionError = new Error('Insufficient permissions: board relationship missing')
    mockOnDelete.mockRejectedValue(permissionError)

    renderCard(postWithoutBoard)

    const card = screen.getByText('Post Without Board').closest('.rounded-md')
    fireEvent.mouseEnter(card)

    const menuButton = screen.getAllByRole('button')[0]
    await user.click(menuButton)

    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    const yesButton = screen.getByText('Yes')
    await user.click(yesButton)

    await waitFor(() => {
      expect(screen.getByText(/board relationship missing/i)).toBeInTheDocument()
    })
  })

  it('logs detailed error information on delete failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const postWithIssue = {
      id: 'post-issue',
      title: 'Problem Post',
      body: 'Test',
      column: 'ideas',
      createdAt: new Date('2026-04-01'),
      updatedAt: new Date('2026-04-01'),
      creator: [],
    }

    const error = new Error('Permission denied')
    mockOnDelete.mockRejectedValue(error)

    renderCard(postWithIssue)

    const card = screen.getByText('Problem Post').closest('.rounded-md')
    fireEvent.mouseEnter(card)

    const menuButton = screen.getAllByRole('button')[0]
    await user.click(menuButton)

    await user.click(screen.getByText('Delete'))
    await user.click(screen.getByText('Yes'))

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Delete failed:', error)
    })

    consoleSpy.mockRestore()
  })

  it('allows delete after moving post to different column', async () => {
    // This simulates the observed behavior where moving a post makes it deletable
    const postAfterMove = {
      id: 'post-moved',
      title: 'Moved Post',
      body: 'Was in ideas, moved to drafts',
      column: 'drafts', // Moved from ideas
      createdAt: new Date('2026-04-01'),
      updatedAt: new Date('2026-04-19'), // Recently moved
      creator: [{ id: 'user-1', email: 'test@example.com' }],
      board: { id: 'board-1' }
    }

    mockOnDelete.mockResolvedValue(undefined)
    renderCard(postAfterMove)

    const card = screen.getByText('Moved Post').closest('.rounded-md')
    fireEvent.mouseEnter(card)

    const menuButton = screen.getAllByRole('button')[0]
    await user.click(menuButton)

    await user.click(screen.getByText('Delete'))
    await user.click(screen.getByText('Yes'))

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('post-moved')
    })
  })
})
