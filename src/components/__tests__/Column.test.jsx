import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Column from '../Column';

const mockColumn = { id: 'ideas', label: 'Scratchpad' };

const mockPosts = [
  { id: '1', title: 'Post 1', body: 'Body 1', column: 'ideas', createdAt: new Date(), updatedAt: new Date() },
  { id: '2', title: 'Post 2', body: 'Body 2', column: 'ideas', createdAt: new Date(), updatedAt: new Date() },
];

const mockProps = {
  column: mockColumn,
  posts: mockPosts,
  onMovePost: vi.fn(),
  onDeletePost: vi.fn(),
  onNewPost: vi.fn(),
  onEditPost: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Column — header', () => {
  it('renders column label', () => {
    render(<Column {...mockProps} />);

    expect(screen.getByText('Scratchpad')).toBeInTheDocument();
  });

  it('shows post count when posts exist', () => {
    render(<Column {...mockProps} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('hides post count when no posts', () => {
    render(<Column {...mockProps} posts={[]} />);

    // Count badge should not be present
    const badge = screen.queryByText('0');
    expect(badge).not.toBeInTheDocument();
  });
});

describe('Column — empty state', () => {
  it('shows empty state when no posts in Ideas column', () => {
    render(<Column {...mockProps} column={{ id: 'ideas', label: 'Scratchpad' }} posts={[]} />);

    expect(screen.getByText(/start with a rough idea/i)).toBeInTheDocument();
    expect(screen.getByText(/just a title is enough/i)).toBeInTheDocument();
  });

  it('shows empty state when no posts in Drafts column', () => {
    render(<Column {...mockProps} column={{ id: 'drafts', label: 'Drafts' }} posts={[]} />);

    expect(screen.getByText(/flesh out your thoughts/i)).toBeInTheDocument();
    expect(screen.getByText(/move ideas here when you're ready to develop them/i)).toBeInTheDocument();
  });

  it('shows empty state when no posts in Finalized column', () => {
    render(<Column {...mockProps} column={{ id: 'finalized', label: 'Published' }} posts={[]} />);

    expect(screen.getByText(/your finished work lives here/i)).toBeInTheDocument();
    expect(screen.getByText(/posts you're proud to share/i)).toBeInTheDocument();
  });

  it('renders FileText icon in empty state', () => {
    const { container } = render(<Column {...mockProps} posts={[]} />);

    // FileText icon from lucide-react renders as SVG
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });
});

describe('Column — post rendering', () => {
  it('renders PostCard for each post', () => {
    render(<Column {...mockProps} />);

    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post 2')).toBeInTheDocument();
  });

  it('renders posts in scrollable container', () => {
    const { container } = render(<Column {...mockProps} />);

    const scrollContainer = container.querySelector('.overflow-y-auto');
    expect(scrollContainer).toBeTruthy();
  });

  it('passes props to PostCard components', () => {
    render(<Column {...mockProps} />);

    // Verify posts render (handlers tested in PostCard tests)
    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post 2')).toBeInTheDocument();
  });
});

describe('Column — layout', () => {
  it('uses flex column layout', () => {
    const { container } = render(<Column {...mockProps} />);

    const column = container.firstChild;
    expect(column.className).toContain('flex');
    expect(column.className).toContain('flex-col');
  });

  it('has card styling', () => {
    const { container } = render(<Column {...mockProps} />);

    const column = container.firstChild;
    expect(column.className).toContain('bg-card');
    expect(column.className).toContain('rounded-lg');
    // Border is applied via inline style (hsl with alpha channel)
  });
});
