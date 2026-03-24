import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PostCard from '../PostCard';

const NOW = new Date('2026-01-15T12:00:00Z');

const makePost = (overrides = {}) => ({
  id: 'post-1',
  title: 'Test post',
  body: 'Some content',
  column: 'ideas',
  updatedAt: NOW.toISOString(),
  ...overrides,
});

const noop = () => {};

function makeProps(overrides = {}) {
  return {
    post: makePost(),
    onMove: vi.fn(),
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onPublish: vi.fn(),
    linkedin: { isConnected: false },
    stalenessTier: null,
    onCoach: vi.fn(),
    ...overrides,
  };
}

// ─── staleness visual states ──────────────────────────────────────────────────

describe('staleness badge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => { vi.useRealTimers(); });

  it('renders no badge when tier is null', () => {
    render(<PostCard {...makeProps({ stalenessTier: null })} />);
    expect(screen.queryByText(/days idle/)).toBeNull();
    expect(screen.queryByText('Ready to publish')).toBeNull();
  });

  it('renders no badge when tier is mild (border only)', () => {
    render(<PostCard {...makeProps({ stalenessTier: 'mild' })} />);
    expect(screen.queryByText(/days idle/)).toBeNull();
    expect(screen.queryByText('Ready to publish')).toBeNull();
  });

  it('renders "N days idle" badge when tier is urgent', () => {
    const post = makePost({ updatedAt: new Date(NOW.getTime() - 7 * 86400000).toISOString() });
    render(<PostCard {...makeProps({ post, stalenessTier: 'urgent' })} />);
    expect(screen.getByText('7 days idle')).toBeInTheDocument();
  });

  it('renders "Ready to publish" badge when tier is finalized-stuck', () => {
    const post = makePost({ column: 'finalized' });
    render(<PostCard {...makeProps({ post, stalenessTier: 'finalized-stuck' })} />);
    expect(screen.getByText('Ready to publish')).toBeInTheDocument();
  });
});

// ─── click routing ────────────────────────────────────────────────────────────

describe('handleCardClick', () => {
  it('calls onCoach when stalenessTier is set', () => {
    const onCoach = vi.fn();
    const onEdit = vi.fn();
    const post = makePost();
    render(<PostCard {...makeProps({ post, stalenessTier: 'urgent', onCoach, onEdit })} />);

    fireEvent.click(screen.getByText('Test post'));

    expect(onCoach).toHaveBeenCalledWith(post);
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('calls onEdit when stalenessTier is null', () => {
    const onCoach = vi.fn();
    const onEdit = vi.fn();
    const post = makePost();
    render(<PostCard {...makeProps({ post, stalenessTier: null, onCoach, onEdit })} />);

    fireEvent.click(screen.getByText('Test post'));

    expect(onEdit).toHaveBeenCalledWith(post);
    expect(onCoach).not.toHaveBeenCalled();
  });

  it('calls onCoach for mild tier (not onEdit)', () => {
    const onCoach = vi.fn();
    const onEdit = vi.fn();
    render(<PostCard {...makeProps({ stalenessTier: 'mild', onCoach, onEdit })} />);

    fireEvent.click(screen.getByText('Test post'));

    expect(onCoach).toHaveBeenCalled();
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('calls onCoach for finalized-stuck tier', () => {
    const onCoach = vi.fn();
    const onEdit = vi.fn();
    const post = makePost({ column: 'finalized' });
    render(<PostCard {...makeProps({ post, stalenessTier: 'finalized-stuck', onCoach, onEdit })} />);

    fireEvent.click(screen.getByText('Test post'));

    expect(onCoach).toHaveBeenCalled();
    expect(onEdit).not.toHaveBeenCalled();
  });
});
