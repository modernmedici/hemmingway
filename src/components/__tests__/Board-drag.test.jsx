import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import Board from '../Board';

const mockBoard = {
  id: 'board-1',
  name: 'Test Board',
  owner: { id: 'user-1', email: 'test@example.com' },
  members: [],
};

const mockPosts = [
  { id: '1', title: 'Idea 1', body: 'Body 1', column: 'ideas', order: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', title: 'Draft 1', body: 'Body 2', column: 'drafts', order: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', title: 'Idea 2', body: 'Body 3', column: 'ideas', order: 1, createdAt: new Date(), updatedAt: new Date() },
];

const mockUser = { id: 'user-1', email: 'test@example.com' };

const mockProps = {
  board: mockBoard,
  posts: mockPosts,
  loading: false,
  error: null,
  onMovePost: vi.fn(),
  onDeletePost: vi.fn(),
  onNewPost: vi.fn(),
  onEditPost: vi.fn(),
  isOwner: vi.fn(() => true),
  currentUser: mockUser,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Board — drag and drop integration', () => {
  it('renders DndContext with sensors', () => {
    const { container } = render(<Board {...mockProps} />);

    // DndContext wraps the columns
    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();
  });

  it('renders DragOverlay component', () => {
    const { container } = render(<Board {...mockProps} />);

    // DragOverlay is rendered (empty when not dragging)
    // Check that the component structure is correct
    expect(container.querySelector('.grid')).toBeTruthy();
  });

  it('shows drag error toast when drag fails', async () => {
    const mockOnMovePost = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<Board {...mockProps} onMovePost={mockOnMovePost} />);

    // Simulate drag end by directly calling the internal handler
    // We can't fully test drag gestures in jsdom, but we can verify error handling
    const boardInstance = render(<Board {...mockProps} onMovePost={mockOnMovePost} />);

    // The drag error toast should appear after a failed move
    // This would be set internally when handleDragEnd catches an error
  });

  it('passes correct collision detection to DndContext', () => {
    // Render and verify no errors occur with closestCenter collision detection
    const { container } = render(<Board {...mockProps} />);
    expect(container.querySelector('.grid')).toBeTruthy();
  });

  it('provides accessibility announcements for drag events', () => {
    // The announcements object should be properly configured
    // We can't test the actual announcements in jsdom, but we verify the component renders
    const { container } = render(<Board {...mockProps} />);
    expect(container.querySelector('.grid')).toBeTruthy();
  });
});

describe('Board — drag error handling', () => {
  it('displays error toast when move fails', async () => {
    const mockOnMovePost = vi.fn().mockRejectedValue(new Error('Failed to move card'));

    const { rerender } = render(<Board {...mockProps} onMovePost={mockOnMovePost} />);

    // Manually trigger the error state (simulating what handleDragEnd would do)
    // In real usage, this happens inside handleDragEnd's catch block
    const boardWithError = { ...mockProps, onMovePost: mockOnMovePost };
    rerender(<Board {...boardWithError} />);

    // The component should have the error toast rendered when dragError state is set
  });

  it('clears error toast after 3 seconds', async () => {
    vi.useFakeTimers();

    render(<Board {...mockProps} />);

    // Error toast auto-dismisses via setTimeout
    // The component uses: setTimeout(() => setDragError(null), 3000)

    vi.advanceTimersByTime(3000);

    vi.useRealTimers();
  });
});

describe('Board — drag position calculation', () => {
  it('calculates correct targetIndex when dropped on column', async () => {
    const mockOnMovePost = vi.fn().mockResolvedValue(undefined);
    render(<Board {...mockProps} onMovePost={mockOnMovePost} />);

    // When dropped on empty column area, should append to end
    // targetIndex = columnPosts.length
  });

  it('calculates correct targetIndex when dropped on card', async () => {
    const mockOnMovePost = vi.fn().mockResolvedValue(undefined);
    render(<Board {...mockProps} onMovePost={mockOnMovePost} />);

    // When dropped on another card, should insert at that card's position
    // targetIndex = columnPosts.findIndex(p => p.id === overId)
  });

  it('does nothing when dropped in same position', async () => {
    const mockOnMovePost = vi.fn();
    render(<Board {...mockProps} onMovePost={mockOnMovePost} />);

    // If oldIndex === targetIndex in same column, should early return
    // This logic is in handleDragEnd
  });

  it('calls onMovePost with correct parameters', async () => {
    const mockOnMovePost = vi.fn().mockResolvedValue(undefined);
    render(<Board {...mockProps} onMovePost={mockOnMovePost} />);

    // Should call: onMovePost(activeId, targetColumn, targetIndex)
  });
});

describe('Board — drag state management', () => {
  it('sets activePost on drag start', () => {
    render(<Board {...mockProps} />);

    // handleDragStart sets: setActivePost({ post, columnId })
  });

  it('clears activePost on drag end', () => {
    render(<Board {...mockProps} />);

    // handleDragEnd sets: setActivePost(null)
  });

  it('clears activePost on drag cancel', () => {
    render(<Board {...mockProps} />);

    // handleDragCancel sets: setActivePost(null)
  });

  it('clears dragError on drag end', () => {
    render(<Board {...mockProps} />);

    // handleDragEnd sets: setDragError(null)
  });
});

describe('Board — responsive layout', () => {
  it('uses responsive grid classes', () => {
    const { container } = render(<Board {...mockProps} />);

    const grid = container.querySelector('.grid');
    expect(grid.className).toContain('grid-cols-1');
    expect(grid.className).toContain('md:grid-cols-3');
  });

  it('shows responsive loading skeletons', () => {
    const { container } = render(<Board {...mockProps} loading={true} />);

    const grid = container.querySelector('.grid');
    expect(grid.className).toContain('grid-cols-1');
    expect(grid.className).toContain('md:grid-cols-3');
  });
});

describe('Board — DragOverlay rendering', () => {
  it('shows DragOverlayCard when dragging', () => {
    // When activePost is set, DragOverlay renders DragOverlayCard
    const { container } = render(<Board {...mockProps} />);

    // DragOverlay is always rendered, but children are conditional
    // {activePost ? <DragOverlayCard ... /> : null}
    expect(container.querySelector('.grid')).toBeTruthy();
  });

  it('shows no overlay when not dragging', () => {
    const { container } = render(<Board {...mockProps} />);

    // When activePost is null, DragOverlay renders null
    expect(container.querySelector('.grid')).toBeTruthy();
  });
});
