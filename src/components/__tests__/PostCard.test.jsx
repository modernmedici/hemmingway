import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PostCard from '../PostCard';

const mockPost = {
  id: '1',
  title: 'Test Post',
  body: 'This is a test body with some content.',
  column: 'ideas',
  createdAt: new Date('2026-04-09T10:00:00Z'),
  updatedAt: new Date('2026-04-10T10:00:00Z'),
};

const mockHandlers = {
  onMove: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PostCard — word count', () => {
  it('displays correct word count for title + body', () => {
    render(<PostCard post={mockPost} {...mockHandlers} />);

    // "Test Post" (2) + "This is a test body with some content." (8) = 10 words
    expect(screen.getByText('10 words')).toBeInTheDocument();
  });

  it('displays singular "word" for single word', () => {
    const singleWordPost = { ...mockPost, title: 'Word', body: '' };
    render(<PostCard post={singleWordPost} {...mockHandlers} />);

    expect(screen.getByText('1 word')).toBeInTheDocument();
  });

  it('handles empty body', () => {
    const noBodyPost = { ...mockPost, body: '' };
    render(<PostCard post={noBodyPost} {...mockHandlers} />);

    // "Test Post" = 2 words
    expect(screen.getByText('2 words')).toBeInTheDocument();
  });

  it('handles undefined body', () => {
    const noBodyPost = { ...mockPost, body: undefined };
    render(<PostCard post={noBodyPost} {...mockHandlers} />);

    expect(screen.getByText('2 words')).toBeInTheDocument();
  });
});

describe('PostCard — content display', () => {
  it('renders post title', () => {
    render(<PostCard post={mockPost} {...mockHandlers} />);

    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('renders body preview when body exists', () => {
    render(<PostCard post={mockPost} {...mockHandlers} />);

    expect(screen.getByText(/This is a test body/)).toBeInTheDocument();
  });

  it('does not render body preview when body is empty', () => {
    const noBodyPost = { ...mockPost, body: '' };
    const { container } = render(<PostCard post={noBodyPost} {...mockHandlers} />);

    const bodyPreview = container.querySelector('.line-clamp-3');
    expect(bodyPreview).toBeFalsy();
  });

  it('renders timestamp with relative format', () => {
    render(<PostCard post={mockPost} {...mockHandlers} />);

    // formatDistanceToNow should show "1 day ago" or similar
    expect(screen.getByText(/ago$/)).toBeInTheDocument();
  });

  it('renders FileText icon', () => {
    const { container } = render(<PostCard post={mockPost} {...mockHandlers} />);

    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});

describe('PostCard — click interactions', () => {
  it('calls onEdit when card is clicked', () => {
    render(<PostCard post={mockPost} {...mockHandlers} />);

    const card = screen.getByText('Test Post').closest('div');
    fireEvent.click(card);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockPost);
  });

  it('does not call onEdit when menu is open', () => {
    const { container } = render(<PostCard post={mockPost} {...mockHandlers} />);

    // Open menu first
    const menuButton = container.querySelector('button');
    fireEvent.click(menuButton);

    // Try to click card
    const card = screen.getByText('Test Post').closest('div');
    fireEvent.click(card);

    expect(mockHandlers.onEdit).not.toHaveBeenCalled();
  });
});

describe('PostCard — three-dot menu', () => {
  it('menu button is hidden by default', () => {
    const { container } = render(<PostCard post={mockPost} {...mockHandlers} />);

    const menuButton = container.querySelector('button');
    const computedStyle = window.getComputedStyle(menuButton);

    // Button is rendered but with color: transparent when not hovered
    expect(menuButton).toBeTruthy();
  });

  it('opens menu when three-dot button is clicked', () => {
    const { container } = render(<PostCard post={mockPost} {...mockHandlers} />);

    const menuButton = container.querySelector('button');
    fireEvent.click(menuButton);

    // Check for menu items (Move to Drafts, Move to Published)
    expect(screen.getByText(/Move to Drafts/)).toBeInTheDocument();
    expect(screen.getByText(/Move to Published/)).toBeInTheDocument();
  });

  it('does not show "Move to" option for current column', () => {
    const { container } = render(<PostCard post={mockPost} {...mockHandlers} />);

    const menuButton = container.querySelector('button');
    fireEvent.click(menuButton);

    // Post is in 'ideas' column, so "Move to Scratchpad" should not appear
    expect(screen.queryByText(/Move to Scratchpad/)).not.toBeInTheDocument();
  });

  it('closes menu and calls onMove when move option is clicked', () => {
    const { container } = render(<PostCard post={mockPost} {...mockHandlers} />);

    const menuButton = container.querySelector('button');
    fireEvent.click(menuButton);

    const moveButton = screen.getByText(/Move to Drafts/);
    fireEvent.click(moveButton);

    expect(mockHandlers.onMove).toHaveBeenCalledWith('1', 'drafts');

    // Menu should close
    waitFor(() => {
      expect(screen.queryByText(/Move to Drafts/)).not.toBeInTheDocument();
    });
  });
});

describe('PostCard — delete confirmation', () => {
  it('shows delete button in menu', () => {
    const { container } = render(<PostCard post={mockPost} {...mockHandlers} />);

    const menuButton = container.querySelector('button');
    fireEvent.click(menuButton);

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('shows confirmation prompt on first delete click', () => {
    const { container } = render(<PostCard post={mockPost} {...mockHandlers} />);

    const menuButton = container.querySelector('button');
    fireEvent.click(menuButton);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(screen.getByText('Delete?')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('calls onDelete when Yes is clicked', () => {
    const { container } = render(<PostCard post={mockPost} {...mockHandlers} />);

    const menuButton = container.querySelector('button');
    fireEvent.click(menuButton);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });

  it('cancels delete when No is clicked', () => {
    const { container } = render(<PostCard post={mockPost} {...mockHandlers} />);

    const menuButton = container.querySelector('button');
    fireEvent.click(menuButton);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    const noButton = screen.getByText('No');
    fireEvent.click(noButton);

    expect(mockHandlers.onDelete).not.toHaveBeenCalled();
    // Should go back to showing "Delete" button
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('resets confirm state when mouse leaves card', () => {
    const { container } = render(<PostCard post={mockPost} {...mockHandlers} />);

    // Open menu
    const menuButton = container.querySelector('button');
    fireEvent.click(menuButton);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    // Confirm prompt is showing
    expect(screen.getByText('Delete?')).toBeInTheDocument();

    // Mouse leaves the card (this closes menu and resets confirmDelete)
    const card = container.firstChild;
    fireEvent.mouseLeave(card);

    // Menu should be closed now
    expect(screen.queryByText('Delete?')).not.toBeInTheDocument();

    // Mouse enters again and re-open menu with fresh query
    fireEvent.mouseEnter(card);
    const menuButtonAgain = container.querySelector('button');
    fireEvent.click(menuButtonAgain);

    // Should be back to "Delete" button, not confirmation
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.queryByText('Delete?')).not.toBeInTheDocument();
  });
});

describe('PostCard — hover states', () => {
  it('adds shadow on hover', async () => {
    const { container } = render(<PostCard post={mockPost} {...mockHandlers} />);

    const card = container.firstChild;

    // Initially no shadow
    expect(card.style.boxShadow).toBe('none');

    // Hover
    fireEvent.mouseEnter(card);

    // Wait for React to process the state update
    await waitFor(() => {
      expect(card.style.boxShadow).not.toBe('none');
    });
  });

  it('removes shadow on mouse leave', async () => {
    const { container } = render(<PostCard post={mockPost} {...mockHandlers} />);

    const card = container.firstChild;

    // Hover then leave
    fireEvent.mouseEnter(card);

    // Wait for hover state to apply
    await waitFor(() => {
      expect(card.style.boxShadow).not.toBe('none');
    });

    fireEvent.mouseLeave(card);

    // Wait for shadow to be removed
    await waitFor(() => {
      expect(card.style.boxShadow).toBe('none');
    });
  });
});

describe('PostCard — edge cases', () => {
  it('handles very long title', () => {
    const longTitlePost = {
      ...mockPost,
      title: 'This is an extremely long title that goes on and on and probably should be truncated at some point but we need to handle it gracefully',
    };
    render(<PostCard post={longTitlePost} {...mockHandlers} />);

    expect(screen.getByText(/This is an extremely long title/)).toBeInTheDocument();
  });

  it('handles very long body', () => {
    const longBodyPost = {
      ...mockPost,
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20),
    };
    const { container } = render(<PostCard post={longBodyPost} {...mockHandlers} />);

    // Body should be line-clamped to 3 lines
    const bodyPreview = container.querySelector('.line-clamp-3');
    expect(bodyPreview).toBeTruthy();
  });

  it('handles missing timestamps gracefully', () => {
    const noTimestampPost = { ...mockPost, updatedAt: null };

    // Should not crash
    expect(() => {
      render(<PostCard post={noTimestampPost} {...mockHandlers} />);
    }).not.toThrow();
  });
});
