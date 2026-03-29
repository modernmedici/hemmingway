import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PostCard from '../PostCard';

function makePost(overrides = {}) {
  return {
    id: 'p1',
    title: 'My Post',
    body: 'Some body text',
    column: 'ideas',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('PostCard — staleness badge', () => {
  it('renders no staleness badge when stalenessTier is null', () => {
    render(<PostCard post={makePost()} stalenessTier={null} onMove={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.queryByRole('img', { name: /stale/i })).toBeNull();
    expect(document.querySelector('[data-staleness]')).toBeNull();
  });

  it('renders an amber badge when stalenessTier is "mild"', () => {
    render(<PostCard post={makePost()} stalenessTier="mild" onMove={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(document.querySelector('[data-staleness="mild"]')).toBeInTheDocument();
  });

  it('renders an amber badge when stalenessTier is "urgent"', () => {
    render(<PostCard post={makePost()} stalenessTier="urgent" onMove={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(document.querySelector('[data-staleness="urgent"]')).toBeInTheDocument();
  });

  it('renders a badge when stalenessTier is "finalized-stuck"', () => {
    render(<PostCard post={makePost({ column: 'finalized' })} stalenessTier="finalized-stuck" onMove={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(document.querySelector('[data-staleness="finalized-stuck"]')).toBeInTheDocument();
  });
});

describe('PostCard — click routing with stalenessTier', () => {
  it('calls onEdit when stalenessTier is null and card is clicked', () => {
    const onEdit = vi.fn();
    const post = makePost();
    render(<PostCard post={post} stalenessTier={null} onMove={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
    fireEvent.click(screen.getByText('My Post'));
    expect(onEdit).toHaveBeenCalledWith(post);
  });

  it('calls onCoach instead of onEdit when stalenessTier is set and card is clicked', () => {
    const onEdit = vi.fn();
    const onCoach = vi.fn();
    const post = makePost();
    render(
      <PostCard
        post={post}
        stalenessTier="mild"
        onMove={vi.fn()}
        onDelete={vi.fn()}
        onEdit={onEdit}
        onCoach={onCoach}
      />
    );
    fireEvent.click(screen.getByText('My Post'));
    expect(onCoach).toHaveBeenCalledWith(post);
    expect(onEdit).not.toHaveBeenCalled();
  });
});

describe('PostCard — existing behavior preserved', () => {
  it('renders title', () => {
    render(<PostCard post={makePost()} stalenessTier={null} onMove={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByText('My Post')).toBeInTheDocument();
  });

  it('renders word count badge', () => {
    render(<PostCard post={makePost()} stalenessTier={null} onMove={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByText(/\d+ words/)).toBeInTheDocument();
  });
});
