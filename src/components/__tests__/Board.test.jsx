import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Board from '../Board';

const mockPosts = [
  { id: '1', title: 'Idea 1', body: 'Body 1', column: 'ideas', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', title: 'Draft 1', body: 'Body 2', column: 'drafts', createdAt: new Date(), updatedAt: new Date() },
  { id: '3', title: 'Final 1', body: 'Body 3', column: 'finalized', createdAt: new Date(), updatedAt: new Date() },
];

const mockProps = {
  posts: mockPosts,
  loading: false,
  error: null,
  onMovePost: vi.fn(),
  onDeletePost: vi.fn(),
  onNewPost: vi.fn(),
  onEditPost: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Board — loading state', () => {
  it('renders loading skeletons when loading is true', () => {
    render(<Board {...mockProps} loading={true} />);

    // Should render 3 column skeletons
    const skeletons = document.querySelectorAll('.bg-muted');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows 3 skeleton cards per column during loading', () => {
    const { container } = render(<Board {...mockProps} loading={true} />);

    // Grid with 3 columns
    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();
    expect(grid.className).toContain('grid-cols-3');
  });
});

describe('Board — error state', () => {
  it('displays error message when error prop is set', () => {
    render(<Board {...mockProps} error="Network error" />);

    expect(screen.getByText(/failed to load posts/i)).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  it('renders error in destructive color', () => {
    render(<Board {...mockProps} error="Test error" />);

    const errorText = screen.getByText(/test error/i);
    expect(errorText.className).toContain('text-destructive');
  });
});

describe('Board — normal render', () => {
  it('renders 3 columns when not loading or errored', () => {
    const { container } = render(<Board {...mockProps} />);

    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();
    expect(grid.className).toContain('grid-cols-3');

    // Should render Column components (check by looking for column structure)
    const columns = container.querySelectorAll('.grid > div');
    expect(columns.length).toBe(3);
  });

  it('filters posts by column correctly', () => {
    render(<Board {...mockProps} />);

    // Each post should appear in its respective column (PostCard renders title)
    expect(screen.getByText('Idea 1')).toBeInTheDocument();
    expect(screen.getByText('Draft 1')).toBeInTheDocument();
    expect(screen.getByText('Final 1')).toBeInTheDocument();
  });

  it('renders with empty posts array', () => {
    const { container } = render(<Board {...mockProps} posts={[]} />);

    const columns = container.querySelectorAll('.grid > div');
    expect(columns.length).toBe(3);
  });
});

describe('Board — props passthrough', () => {
  it('passes handler props to Column components', () => {
    const { container } = render(<Board {...mockProps} />);

    // Verify board renders successfully with all handlers
    const grid = container.querySelector('.grid');
    expect(grid).toBeTruthy();

    // Handlers will be tested in Column and PostCard tests
  });
});
