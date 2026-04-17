import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WritingView from '../WritingView';

const mockPost = {
  title: 'Test Post',
  body: 'This is the body text.',
  column: 'ideas',
};

const mockOnSave = vi.fn();
const mockOnCancel = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  // Track fullscreen state for proper mocking
  let isFullscreen = false;

  // Mock document.fullscreenElement with getter
  Object.defineProperty(document, 'fullscreenElement', {
    configurable: true,
    get: () => isFullscreen ? document.documentElement : null,
  });

  // Mock fullscreen API with state updates
  document.documentElement.requestFullscreen = vi.fn().mockImplementation(async () => {
    isFullscreen = true;
    // Trigger fullscreenchange event
    document.dispatchEvent(new Event('fullscreenchange'));
  });

  document.exitFullscreen = vi.fn().mockImplementation(async () => {
    isFullscreen = false;
    // Trigger fullscreenchange event
    document.dispatchEvent(new Event('fullscreenchange'));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('WritingView — rendering', () => {
  it('renders title and body inputs', () => {
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByPlaceholderText('Essay Title')).toHaveValue('Test Post');
    expect(screen.getByPlaceholderText('Start writing your thoughts...')).toHaveValue('This is the body text.');
  });

  it('renders with empty post (new post)', () => {
    render(<WritingView post={null} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByPlaceholderText('Essay Title')).toHaveValue('');
    expect(screen.getByPlaceholderText('Start writing your thoughts...')).toHaveValue('');
  });

  it('shows word count', () => {
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    // "Test Post" + "This is the body text." = 7 words
    expect(screen.getByText('7 words')).toBeInTheDocument();
  });

  it('shows singular "word" for count of 1', () => {
    const singleWordPost = { title: 'Title', body: '', column: 'ideas' };
    render(<WritingView post={singleWordPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByText('1 word')).toBeInTheDocument();
  });

  it('shows "0 words" for empty post', () => {
    render(<WritingView post={null} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByText('0 words')).toBeInTheDocument();
  });

  it('updates word count as user types', async () => {
    render(<WritingView post={null} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    const titleInput = screen.getByPlaceholderText('Essay Title');
    fireEvent.change(titleInput, { target: { value: 'My New Title' } });

    await waitFor(() => {
      expect(screen.getByText('3 words')).toBeInTheDocument();
    });

    const bodyInput = screen.getByPlaceholderText('Start writing your thoughts...');
    fireEvent.change(bodyInput, { target: { value: 'This is some body content' } });

    await waitFor(() => {
      expect(screen.getByText('8 words')).toBeInTheDocument();
    });
  });
});

describe('WritingView — save functionality', () => {
  it('saves when Save button is clicked', async () => {
    mockOnSave.mockResolvedValue(undefined);
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('Test Post', 'This is the body text.', 'ideas', false);
    });
  });

  it('trims whitespace before saving', async () => {
    mockOnSave.mockResolvedValue(undefined);
    render(<WritingView post={null} defaultColumn="drafts" onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByPlaceholderText('Essay Title'), {
      target: { value: '  Title with spaces  ' },
    });
    fireEvent.change(screen.getByPlaceholderText('Start writing your thoughts...'), {
      target: { value: '  Body with spaces  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('Title with spaces', 'Body with spaces', 'drafts', false);
    });
  });

  it('does not save when title is empty', async () => {
    render(<WritingView post={null} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByPlaceholderText('Start writing your thoughts...'), {
      target: { value: 'Body without title' },
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it('shows "Saved!" indicator after successful save', async () => {
    mockOnSave.mockResolvedValue(undefined);
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText('Saved!')).toBeInTheDocument();
    });
  });

  it('disables save button while saving', async () => {
    mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });
  });
});

describe('WritingView — cancel/navigation', () => {
  it('calls onCancel when Back button is clicked', () => {
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    const backButton = screen.getByRole('button', { name: /back to board/i });
    fireEvent.click(backButton);

    expect(mockOnCancel).toHaveBeenCalledOnce();
  });

  it('auto-saves changes before canceling', async () => {
    mockOnSave.mockResolvedValue(undefined);
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Make changes
    fireEvent.change(screen.getByPlaceholderText('Essay Title'), {
      target: { value: 'Modified Title' },
    });

    // Click back
    fireEvent.click(screen.getByRole('button', { name: /back to board/i }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('Modified Title', 'This is the body text.', 'ideas', false);
      expect(mockOnCancel).toHaveBeenCalledOnce();
    });
  });

  it('does not auto-save when no changes were made', async () => {
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByRole('button', { name: /back to board/i }));

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
      expect(mockOnCancel).toHaveBeenCalledOnce();
    });
  });

  it('does not auto-save when title is empty', async () => {
    const emptyPost = { title: '', body: '', column: 'ideas' };
    render(<WritingView post={emptyPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByPlaceholderText('Start writing your thoughts...'), {
      target: { value: 'Some body' },
    });

    fireEvent.click(screen.getByRole('button', { name: /back to board/i }));

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
      expect(mockOnCancel).toHaveBeenCalledOnce();
    });
  });
});

describe('WritingView — keyboard shortcuts', () => {
  it('saves on Cmd+Enter', async () => {
    mockOnSave.mockResolvedValue(undefined);
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.keyDown(window, { key: 'Enter', metaKey: true });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('Test Post', 'This is the body text.', 'ideas', true);
    });
  });

  it('saves on Ctrl+Enter', async () => {
    mockOnSave.mockResolvedValue(undefined);
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true });

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('Test Post', 'This is the body text.', 'ideas', true);
    });
  });

  it('exits on Escape when not in fullscreen', () => {
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(mockOnCancel).toHaveBeenCalledOnce();
  });
});

describe('WritingView — fullscreen mode', () => {
  it('has a fullscreen toggle button', () => {
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    const fullscreenButton = screen.getByTitle('Fullscreen (⌘⇧F)');
    expect(fullscreenButton).toBeInTheDocument();
  });

  it('enters fullscreen when button is clicked', async () => {
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    const fullscreenButton = screen.getByTitle('Fullscreen (⌘⇧F)');
    fireEvent.click(fullscreenButton);

    await waitFor(() => {
      expect(document.documentElement.requestFullscreen).toHaveBeenCalledOnce();
    });
  });

  it('enters fullscreen on Cmd+Shift+F', async () => {
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.keyDown(window, { key: 'F', metaKey: true, shiftKey: true });

    await waitFor(() => {
      expect(document.documentElement.requestFullscreen).toHaveBeenCalledOnce();
    });
  });

  it('exits fullscreen on Escape when in fullscreen', async () => {
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Enter fullscreen first
    fireEvent.keyDown(window, { key: 'F', metaKey: true, shiftKey: true });

    await waitFor(() => {
      expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
    });

    // Now exit with Escape
    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(document.exitFullscreen).toHaveBeenCalledOnce();
      expect(mockOnCancel).not.toHaveBeenCalled(); // Should exit fullscreen, not cancel
    });
  });

  it('toggles fullscreen on Cmd+Shift+F when already in fullscreen', async () => {
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Enter fullscreen first
    fireEvent.keyDown(window, { key: 'F', metaKey: true, shiftKey: true });

    await waitFor(() => {
      expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
    });

    // Toggle again to exit
    fireEvent.keyDown(window, { key: 'F', metaKey: true, shiftKey: true });

    await waitFor(() => {
      expect(document.exitFullscreen).toHaveBeenCalledOnce();
    });
  });

  it('shows exit button in fullscreen mode', async () => {
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Enter fullscreen programmatically
    fireEvent.keyDown(window, { key: 'F', metaKey: true, shiftKey: true });

    await waitFor(() => {
      // The component sets zenMode=true after requestFullscreen resolves
      // The exit button appears with "Exit Fullscreen (Esc)"
      expect(screen.queryByText('Exit Fullscreen (Esc)')).toBeInTheDocument();
    });
  });

  it('hides header and footer in fullscreen mode', async () => {
    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    // Before fullscreen
    expect(screen.getByText('Back to Board')).toBeInTheDocument();
    expect(screen.getByText(/⌘↵ to save/)).toBeInTheDocument();

    // Enter fullscreen
    fireEvent.keyDown(window, { key: 'F', metaKey: true, shiftKey: true });

    await waitFor(() => {
      expect(screen.queryByText('Back to Board')).not.toBeInTheDocument();
      expect(screen.queryByText(/⌘↵ to save/)).not.toBeInTheDocument();
    });
  });

  it('falls back gracefully when fullscreen API fails', async () => {
    document.documentElement.requestFullscreen = vi.fn().mockRejectedValue(new Error('Not supported'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<WritingView post={mockPost} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    fireEvent.keyDown(window, { key: 'F', metaKey: true, shiftKey: true });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to enter fullscreen:', expect.any(Error));
      // Should still show zen mode UI even if native fullscreen fails
      expect(screen.queryByText('Exit Fullscreen (Esc)')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});

describe('WritingView — focus behavior', () => {
  it('focuses title input on mount', () => {
    render(<WritingView post={null} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    const titleInput = screen.getByPlaceholderText('Essay Title');
    expect(document.activeElement).toBe(titleInput);
  });

  it('auto-resizes title textarea as content grows', async () => {
    render(<WritingView post={null} defaultColumn="ideas" onSave={mockOnSave} onCancel={mockOnCancel} />);

    const titleInput = screen.getByPlaceholderText('Essay Title');

    // Initial height
    const initialHeight = titleInput.style.height;

    // Add a long title
    fireEvent.change(titleInput, {
      target: { value: 'This is a very long title that should cause the textarea to grow in height' },
    });

    await waitFor(() => {
      // Height should be auto-adjusted (set to scrollHeight)
      expect(titleInput.style.height).toBeTruthy();
    });
  });
});
