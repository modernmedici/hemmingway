import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DragOverlayCard from '../DragOverlayCard';

const mockPost = {
  id: '1',
  title: 'Test Post',
  body: 'This is a test body with some content.',
  column: 'drafts',
  createdAt: new Date('2026-04-09T10:00:00Z'),
  updatedAt: new Date('2026-04-10T10:00:00Z'),
};

describe('DragOverlayCard — content display', () => {
  it('renders post title', () => {
    render(<DragOverlayCard post={mockPost} columnId="drafts" />);

    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('renders body preview when body exists and not in ideas column', () => {
    render(<DragOverlayCard post={mockPost} columnId="drafts" />);

    expect(screen.getByText(/This is a test body/)).toBeInTheDocument();
  });

  it('renders word count for non-ideas columns', () => {
    render(<DragOverlayCard post={mockPost} columnId="drafts" />);

    // "Test Post" (2) + "This is a test body with some content." (8) = 10 words
    expect(screen.getByText('10 words')).toBeInTheDocument();
  });

  it('does not render body preview in ideas column', () => {
    const { container } = render(<DragOverlayCard post={mockPost} columnId="ideas" />);

    const bodyPreview = container.querySelector('.line-clamp-3');
    expect(bodyPreview).toBeFalsy();
  });

  it('does not render word count in ideas column', () => {
    render(<DragOverlayCard post={mockPost} columnId="ideas" />);

    expect(screen.queryByText(/words/)).not.toBeInTheDocument();
  });

  it('renders timestamp with relative format', () => {
    render(<DragOverlayCard post={mockPost} columnId="drafts" />);

    expect(screen.getByText(/ago$/)).toBeInTheDocument();
  });
});

describe('DragOverlayCard — styling', () => {
  it('has elevated shadow for drag effect', () => {
    const { container } = render(<DragOverlayCard post={mockPost} columnId="drafts" />);

    const card = container.firstChild;
    expect(card.style.boxShadow).toContain('0 12px 28px');
  });

  it('has rotation transform', () => {
    const { container } = render(<DragOverlayCard post={mockPost} columnId="drafts" />);

    const card = container.firstChild;
    expect(card.style.transform).toContain('rotate(2deg)');
  });

  it('has cursor-grabbing class', () => {
    const { container } = render(<DragOverlayCard post={mockPost} columnId="drafts" />);

    const card = container.firstChild;
    expect(card.className).toContain('cursor-grabbing');
  });
});
