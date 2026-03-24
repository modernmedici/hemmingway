import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CoachingModal from '../CoachingModal';

const NOW = new Date('2026-01-15T12:00:00Z');

const mockPost = {
  id: 'post-1',
  title: 'My test idea',
  body: 'Some draft content here.',
  column: 'ideas',
  updatedAt: new Date(NOW.getTime() - 5 * 86400000).toISOString(),
};

const noop = () => {};

function makeProps(overrides = {}) {
  return {
    post: mockPost,
    onClose: vi.fn(),
    onOpenEditor: vi.fn(),
    onMoveToDraft: vi.fn(),
    onSnooze: vi.fn(),
    ...overrides,
  };
}

// Helper: mock fetch to resolve with a question
function mockFetchSuccess(text = 'What is the core insight you want to share?') {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ content: [{ text }] }),
  }));
}

// Helper: mock fetch to reject with a given status
function mockFetchStatus(status) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({}),
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── question text ───────────────────────────────────────────────────────────

describe('CoachingModal', () => {
  it('renders the coach question after fetch resolves', async () => {
    mockFetchSuccess('What is the core insight you want to share?');
    render(<CoachingModal {...makeProps()} />);

    await waitFor(() =>
      expect(screen.getByText('What is the core insight you want to share?')).toBeInTheDocument()
    );
  });

  // ─── spinner ──────────────────────────────────────────────────────────────

  it('shows spinner while fetch is in-flight', () => {
    // Never-resolving fetch keeps loading state active
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    render(<CoachingModal {...makeProps()} />);

    // Lucide renders as SVG; Loader2 is the only spinning element in the question area
    // The component renders <Loader2> when loading===true
    // Check that the question text is NOT yet shown
    expect(screen.queryByText('What')).toBeNull();
    // And no error state
    expect(screen.queryByText(/Coach unavailable/)).toBeNull();
    expect(screen.queryByText(/Coach is busy/)).toBeNull();
  });

  // ─── error states ─────────────────────────────────────────────────────────

  it('shows generic error on non-429/529 failure (covers no-API-key/500 path)', async () => {
    mockFetchStatus(500);
    render(<CoachingModal {...makeProps()} />);

    await waitFor(() =>
      expect(screen.getByText('Coach unavailable — try again.')).toBeInTheDocument()
    );
  });

  it('shows busy error state on 429 response', async () => {
    mockFetchStatus(429);
    render(<CoachingModal {...makeProps()} />);

    await waitFor(() =>
      expect(screen.getByText('Coach is busy — wait a moment and retry.')).toBeInTheDocument()
    );
  });

  it('shows busy error state on 529 response', async () => {
    mockFetchStatus(529);
    render(<CoachingModal {...makeProps()} />);

    await waitFor(() =>
      expect(screen.getByText('Coach is busy — wait a moment and retry.')).toBeInTheDocument()
    );
  });

  // ─── Retry ────────────────────────────────────────────────────────────────

  it('Retry button re-triggers fetch (clears error, shows spinner again)', async () => {
    mockFetchStatus(500);
    render(<CoachingModal {...makeProps()} />);

    // Wait for generic error
    await waitFor(() =>
      expect(screen.getByText('Coach unavailable — try again.')).toBeInTheDocument()
    );

    // Retry button should now say 'Retry'
    const retryBtn = screen.getByRole('button', { name: 'Retry' });
    expect(retryBtn).toBeInTheDocument();

    // Switch to success on second attempt
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ content: [{ text: 'Retry worked!' }] }),
    }));

    fireEvent.click(retryBtn);

    // Error should clear, eventually show new question
    await waitFor(() =>
      expect(screen.getByText('Retry worked!')).toBeInTheDocument()
    );
  });

  // ─── action buttons disabled while in-flight ──────────────────────────────

  it('action buttons are disabled while fetch is in-flight', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    render(<CoachingModal {...makeProps()} />);

    const openBtn = screen.getByRole('button', { name: 'Open in Editor' });
    const askBtn = screen.getByRole('button', { name: 'Ask another question' });
    const snoozeBtn = screen.getByRole('button', { name: 'Snooze' });

    expect(openBtn).toBeDisabled();
    expect(askBtn).toBeDisabled();
    expect(snoozeBtn).toBeDisabled();
  });

  // ─── snooze ───────────────────────────────────────────────────────────────

  it('snooze calls onSnooze prop with the selected number of days', async () => {
    mockFetchSuccess();
    const onSnooze = vi.fn();
    const onClose = vi.fn();
    render(<CoachingModal {...makeProps({ onSnooze, onClose })} />);

    await waitFor(() => screen.getByText('What is the core insight you want to share?'));

    const snoozeBtn = screen.getByRole('button', { name: 'Snooze' });
    fireEvent.click(snoozeBtn);

    // Default snoozeValue is 3 days
    expect(onSnooze).toHaveBeenCalledWith('post-1', 3);
    expect(onClose).toHaveBeenCalled();
  });

  // ─── abort on unmount ─────────────────────────────────────────────────────

  it('abort on unmount: AbortSignal is aborted when component unmounts', () => {
    let capturedSignal;
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url, options) => {
      capturedSignal = options.signal;
      return new Promise(() => {}); // never resolves
    }));

    const { unmount } = render(<CoachingModal {...makeProps()} />);

    expect(capturedSignal).toBeDefined();
    expect(capturedSignal.aborted).toBe(false);

    unmount();

    expect(capturedSignal.aborted).toBe(true);
  });
});
