import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CoachingModal from '../CoachingModal';

const mockAsk = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  window.api = { coach: { ask: mockAsk } };
});

function makePost(overrides = {}) {
  return {
    id: 'p1',
    title: 'Test title',
    body: 'Test body',
    column: 'ideas',
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// ── Loading state ───────────────────────────────────────────────────────────

describe('CoachingModal — loading state', () => {
  it('shows a spinner while the API call is in flight', async () => {
    mockAsk.mockReturnValue(new Promise(() => {})); // never resolves
    render(<CoachingModal post={makePost()} onClose={vi.fn()} onSnooze={vi.fn()} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('disables action buttons while loading', async () => {
    mockAsk.mockReturnValue(new Promise(() => {}));
    render(<CoachingModal post={makePost()} onClose={vi.fn()} onSnooze={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    // All interactive buttons should be disabled during load
    const actionButtons = buttons.filter(b => !b.closest('[aria-label="Close"]') && b.getAttribute('aria-label') !== 'Close');
    expect(actionButtons.every(b => b.disabled || b.getAttribute('aria-disabled') === 'true')).toBe(true);
  });
});

// ── Success state ───────────────────────────────────────────────────────────

describe('CoachingModal — success state', () => {
  it('renders the coaching question text after successful API call', async () => {
    mockAsk.mockResolvedValue('What is the core argument of your piece?');
    render(<CoachingModal post={makePost()} onClose={vi.fn()} onSnooze={vi.fn()} />);
    await screen.findByText('What is the core argument of your piece?');
  });

  it('passes title and body to the API', async () => {
    mockAsk.mockResolvedValue('A question');
    const post = makePost({ title: 'My Essay', body: 'Some content' });
    render(<CoachingModal post={post} onClose={vi.fn()} onSnooze={vi.fn()} />);
    await screen.findByText('A question');
    expect(mockAsk).toHaveBeenCalledWith({ title: 'My Essay', body: 'Some content' });
  });

  it('shows "Ask another question" button after success', async () => {
    mockAsk.mockResolvedValue('A question');
    render(<CoachingModal post={makePost()} onClose={vi.fn()} onSnooze={vi.fn()} />);
    await screen.findByText('A question');
    expect(screen.getByRole('button', { name: /ask another/i })).toBeInTheDocument();
  });

  it('clicking "Ask another question" shows spinner and calls API again', async () => {
    mockAsk
      .mockResolvedValueOnce('First question')
      .mockReturnValueOnce(new Promise(() => {}));
    render(<CoachingModal post={makePost()} onClose={vi.fn()} onSnooze={vi.fn()} />);
    await screen.findByText('First question');
    fireEvent.click(screen.getByRole('button', { name: /ask another/i }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(mockAsk).toHaveBeenCalledTimes(2);
  });
});

// ── "Turn into draft" ───────────────────────────────────────────────────────

describe('CoachingModal — Turn into draft button', () => {
  it('shows "Turn into draft" for a post in the ideas column', async () => {
    mockAsk.mockResolvedValue('A question');
    render(<CoachingModal post={makePost({ column: 'ideas' })} onClose={vi.fn()} onSnooze={vi.fn()} onMovePost={vi.fn()} />);
    await screen.findByText('A question');
    expect(screen.getByRole('button', { name: /turn into draft/i })).toBeInTheDocument();
  });

  it('does NOT show "Turn into draft" for a post in the drafts column', async () => {
    mockAsk.mockResolvedValue('A question');
    render(<CoachingModal post={makePost({ column: 'drafts' })} onClose={vi.fn()} onSnooze={vi.fn()} onMovePost={vi.fn()} />);
    await screen.findByText('A question');
    expect(screen.queryByRole('button', { name: /turn into draft/i })).toBeNull();
  });

  it('does NOT show "Turn into draft" for a post in finalized column', async () => {
    mockAsk.mockResolvedValue('A question');
    render(<CoachingModal post={makePost({ column: 'finalized' })} onClose={vi.fn()} onSnooze={vi.fn()} onMovePost={vi.fn()} />);
    await screen.findByText('A question');
    expect(screen.queryByRole('button', { name: /turn into draft/i })).toBeNull();
  });
});

// ── Error states ────────────────────────────────────────────────────────────

describe('CoachingModal — error states', () => {
  it('shows auth error message for code "auth"', async () => {
    mockAsk.mockRejectedValue({ code: 'auth' });
    render(<CoachingModal post={makePost()} onClose={vi.fn()} onSnooze={vi.fn()} />);
    await screen.findByText(/invalid api key/i);
  });

  it('shows busy error message for code "busy"', async () => {
    mockAsk.mockRejectedValue({ code: 'busy' });
    render(<CoachingModal post={makePost()} onClose={vi.fn()} onSnooze={vi.fn()} />);
    await screen.findByText(/busy/i);
  });

  it('shows generic error message for code "timeout"', async () => {
    mockAsk.mockRejectedValue({ code: 'timeout' });
    render(<CoachingModal post={makePost()} onClose={vi.fn()} onSnooze={vi.fn()} />);
    await screen.findByText(/unavailable/i);
  });

  it('shows generic error message for code "error"', async () => {
    mockAsk.mockRejectedValue({ code: 'error' });
    render(<CoachingModal post={makePost()} onClose={vi.fn()} onSnooze={vi.fn()} />);
    await screen.findByText(/unavailable/i);
  });
});

// ── Snooze & close ──────────────────────────────────────────────────────────

describe('CoachingModal — snooze and close', () => {
  it('calls onSnooze with post id and 1 when "Snooze 1 day" is clicked', async () => {
    mockAsk.mockResolvedValue('A question');
    const onSnooze = vi.fn();
    render(<CoachingModal post={makePost({ id: 'abc' })} onClose={vi.fn()} onSnooze={onSnooze} />);
    await screen.findByText('A question');
    fireEvent.click(screen.getByRole('button', { name: /snooze/i }));
    expect(onSnooze).toHaveBeenCalledWith('abc', 1);
  });

  it('calls onClose when the close button is clicked', async () => {
    mockAsk.mockReturnValue(new Promise(() => {}));
    const onClose = vi.fn();
    render(<CoachingModal post={makePost()} onClose={onClose} onSnooze={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', async () => {
    mockAsk.mockReturnValue(new Promise(() => {}));
    const onClose = vi.fn();
    render(<CoachingModal post={makePost()} onClose={onClose} onSnooze={vi.fn()} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
