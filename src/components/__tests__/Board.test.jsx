import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Board from '../Board';

const noop = () => {};

function makeProps(overrides = {}) {
  return {
    posts: [],
    onMovePost: noop,
    onDeletePost: noop,
    onNewPost: noop,
    onEditPost: noop,
    onPublish: noop,
    linkedin: { isConnected: false },
    getTier: () => null,
    onCoach: noop,
    staleCount: 0,
    ...overrides,
  };
}

// ─── header count badge ───────────────────────────────────────────────────────

describe('stale count badge', () => {
  it('shows badge with count when staleCount > 0', () => {
    render(<Board {...makeProps({ staleCount: 3 })} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/posts need attention/)).toBeInTheDocument();
  });

  it('uses singular "post" (no s) when staleCount is 1', () => {
    const { container } = render(<Board {...makeProps({ staleCount: 1 })} />);
    // "post need attention" (singular) vs "posts need attention" (plural)
    expect(container.textContent).toContain('post need attention');
    expect(container.textContent).not.toContain('posts need attention');
  });

  it('hides badge when staleCount is 0', () => {
    render(<Board {...makeProps({ staleCount: 0 })} />);
    expect(screen.queryByText(/need attention/)).toBeNull();
  });
});
