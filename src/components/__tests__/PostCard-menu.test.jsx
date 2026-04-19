import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostCard from '../PostCard'
import { DndWrapper } from '../../test/dnd-wrapper'

describe('PostCard menu behavior', () => {
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
    vi.useFakeTimers()
    mockOnDelete = vi.fn()
    mockOnEdit = vi.fn()
    mockOnMove = vi.fn()
    user = userEvent.setup({ delay: null })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  const renderCard = () => {
    return render(
      <DndWrapper items={[mockPost.id]}>
        <PostCard
          post={mockPost}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onMove={mockOnMove}
          showAttribution={false}
          boardName="My Board"
          columnId="ideas"
        />
      </DndWrapper>
    )
  }

  it('keeps menu open with 200ms delay when mouse leaves card', async () => {
    renderCard()

    const card = screen.getByText('Test Post').closest('.rounded-md')
    fireEvent.mouseEnter(card)

    const menuButton = screen.getAllByRole('button')[0]
    await user.click(menuButton)

    // Menu should be visible
    expect(screen.getByText('Download .md')).toBeInTheDocument()

    // Mouse leaves card
    fireEvent.mouseLeave(card)

    // Menu should still be visible immediately
    expect(screen.getByText('Download .md')).toBeInTheDocument()

    // After 200ms, menu should close
    vi.advanceTimersByTime(200)
    await waitFor(() => {
      expect(screen.queryByText('Download .md')).not.toBeInTheDocument()
    })
  })

  it('keeps menu open when mouse moves from card to menu', async () => {
    renderCard()

    const card = screen.getByText('Test Post').closest('.rounded-md')
    fireEvent.mouseEnter(card)

    const menuButton = screen.getAllByRole('button')[0]
    await user.click(menuButton)

    expect(screen.getByText('Download .md')).toBeInTheDocument()

    // Mouse leaves card
    fireEvent.mouseLeave(card)

    // Before 200ms passes, mouse enters menu
    vi.advanceTimersByTime(100)
    const menu = screen.getByText('Download .md').closest('div')
    fireEvent.mouseEnter(menu)

    // Advance past the 200ms
    vi.advanceTimersByTime(150)

    // Menu should still be open
    expect(screen.getByText('Download .md')).toBeInTheDocument()
  })

  it('closes menu when mouse leaves menu area', async () => {
    renderCard()

    const card = screen.getByText('Test Post').closest('.rounded-md')
    fireEvent.mouseEnter(card)

    const menuButton = screen.getAllByRole('button')[0]
    await user.click(menuButton)

    const menu = screen.getByText('Download .md').closest('div')
    fireEvent.mouseEnter(menu)

    expect(screen.getByText('Download .md')).toBeInTheDocument()

    // Mouse leaves menu
    fireEvent.mouseLeave(menu)

    await waitFor(() => {
      expect(screen.queryByText('Download .md')).not.toBeInTheDocument()
    })
  })

  it('cancels close timeout when re-entering card', async () => {
    renderCard()

    const card = screen.getByText('Test Post').closest('.rounded-md')
    fireEvent.mouseEnter(card)

    const menuButton = screen.getAllByRole('button')[0]
    await user.click(menuButton)

    // Mouse leaves card, starting timeout
    fireEvent.mouseLeave(card)

    // Before timeout completes, mouse re-enters card
    vi.advanceTimersByTime(100)
    fireEvent.mouseEnter(card)

    // Advance past original timeout
    vi.advanceTimersByTime(150)

    // Menu should still be open
    expect(screen.getByText('Download .md')).toBeInTheDocument()
  })
})
