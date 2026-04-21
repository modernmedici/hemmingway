import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostCard from '../PostCard'
import { DndWrapper } from '../../test/dnd-wrapper'

describe('PostCard delete functionality', () => {
  const mockPost = {
    id: 'post-1',
    title: 'Test Post',
    body: 'Test body',
    column: 'ideas',
    createdAt: new Date('2026-04-17'),
    updatedAt: new Date('2026-04-17'),
  }

  let mockOnDelete, mockOnEdit, mockOnMove
  let user

  beforeEach(() => {
    mockOnDelete = vi.fn()
    mockOnEdit = vi.fn()
    mockOnMove = vi.fn()
    user = userEvent.setup()
  })

  const renderCard = (onDelete = mockOnDelete) => {
    return render(
      <DndWrapper items={[mockPost.id]}>
        <PostCard
          post={mockPost}
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

  it('shows delete confirmation on first click', async () => {
    renderCard()

    // Hover to show menu button
    const card = screen.getByText('Test Post').closest('.rounded-md')
    fireEvent.mouseEnter(card)

    // Open menu
    const menuButton = screen.getAllByRole('button')[0] // First button is the menu button
    await user.click(menuButton)

    // Click delete
    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    // Should show confirmation
    expect(screen.getByText('Delete?')).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()

    // Should NOT have called onDelete yet
    expect(mockOnDelete).not.toHaveBeenCalled()
  })

  it('calls onDelete when clicking Yes', async () => {
    mockOnDelete.mockResolvedValue(undefined)
    renderCard()

    // Hover to show menu
    const card = screen.getByText('Test Post').closest('.rounded-md')
    fireEvent.mouseEnter(card)

    // Open menu
    const menuButton = screen.getAllByRole('button')[0]
    await user.click(menuButton)

    // Click delete
    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    // Click Yes
    const yesButton = screen.getByText('Yes')
    await user.click(yesButton)

    // Should call onDelete with post ID
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('post-1')
    })
  })

  it('cancels delete when clicking No', async () => {
    renderCard()

    // Hover to show menu
    const card = screen.getByText('Test Post').closest('.rounded-md')
    fireEvent.mouseEnter(card)

    // Open menu
    const menuButton = screen.getAllByRole('button')[0]
    await user.click(menuButton)

    // Click delete
    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    // Click No
    const noButton = screen.getByText('No')
    await user.click(noButton)

    // Should NOT call onDelete
    expect(mockOnDelete).not.toHaveBeenCalled()

    // Should hide confirmation
    expect(screen.queryByText('Delete?')).not.toBeInTheDocument()
  })

  it('shows error message when delete fails', async () => {
    const deleteError = new Error('Permission denied')
    mockOnDelete.mockRejectedValue(deleteError)

    renderCard()

    // Hover to show menu
    const card = screen.getByText('Test Post').closest('.rounded-md')
    fireEvent.mouseEnter(card)

    // Open menu
    const menuButton = screen.getAllByRole('button')[0]
    await user.click(menuButton)

    // Click delete
    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    // Click Yes
    const yesButton = screen.getByText('Yes')
    await user.click(yesButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Permission denied/i)).toBeInTheDocument()
    })

    // Should reset confirmation state
    expect(screen.queryByText('Delete?')).not.toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('closes menu when delete succeeds', async () => {
    mockOnDelete.mockResolvedValue(undefined)

    renderCard()

    // Hover to show menu
    const card = screen.getByText('Test Post').closest('.rounded-md')
    fireEvent.mouseEnter(card)

    // Open menu
    const menuButton = screen.getAllByRole('button')[0]
    await user.click(menuButton)

    // Menu should be open
    expect(screen.getByText('Download .md')).toBeInTheDocument()

    // Click delete
    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    // Click Yes
    const yesButton = screen.getByText('Yes')
    await user.click(yesButton)

    // Wait for delete to complete
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalled()
    })

    // Menu should be closed (Download button should be gone)
    expect(screen.queryByText('Download .md')).not.toBeInTheDocument()
  })

  it('awaits onDelete promise before closing menu', async () => {
    let resolveDelete
    const deletePromise = new Promise((resolve) => {
      resolveDelete = resolve
    })
    mockOnDelete.mockReturnValue(deletePromise)

    renderCard()

    // Hover and open menu
    const card = screen.getByText('Test Post').closest('.rounded-md')
    fireEvent.mouseEnter(card)
    const menuButton = screen.getAllByRole('button')[0]
    await user.click(menuButton)

    // Click delete -> Yes
    await user.click(screen.getByText('Delete'))
    await user.click(screen.getByText('Yes'))

    // Menu should still be open (delete hasn't resolved)
    expect(screen.getByText('Download .md')).toBeInTheDocument()

    // Resolve the delete
    resolveDelete()

    // Now menu should close
    await waitFor(() => {
      expect(screen.queryByText('Download .md')).not.toBeInTheDocument()
    })
  })
})
