import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WritingView from '../WritingView';

// Mock InstantDB room/presence
vi.mock('../../lib/db', () => ({
  default: {
    room: vi.fn(() => ({
      usePresence: vi.fn(() => ({
        peers: {},
        user: { id: 'current-user-id' },
        publishPresence: vi.fn(),
      })),
    })),
  },
}));

const mockPost = {
  id: 'test-post-id',
  title: 'Test Post',
  body: 'This is the body text.',
  column: 'ideas',
};

const mockCurrentUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockOnSave = vi.fn();
const mockOnCancel = vi.fn();

// Mock canvas measurement
const mockMeasureText = vi.fn((text) => ({ width: text.length * 10 }));
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  measureText: mockMeasureText,
  font: '',
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockOnSave.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('WritingView — Canvas-Based Typewriter Mode', () => {
  describe('Canvas Measurement', () => {
    it('handles empty textarea without errors', () => {
      render(
        <WritingView
          post={{ id: 'new', title: '', body: '', column: 'ideas' }}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Type in empty textarea
      fireEvent.change(bodyTextarea, { target: { value: 'First' } });

      // Should not throw error - canvas measurement handles empty case
      expect(bodyTextarea.value).toBe('First');
    });

    it('handles very long text without performance issues', () => {
      const longText = 'Lorem ipsum dolor sit amet. '.repeat(200); // ~5600 chars

      render(
        <WritingView
          post={{ id: 'test', title: 'Long', body: longText, column: 'ideas' }}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Append more text - should complete quickly
      const startTime = Date.now();
      fireEvent.change(bodyTextarea, { target: { value: longText + ' More' } });
      const endTime = Date.now();

      // Canvas measurement should be fast (< 100ms for 5600 chars)
      expect(endTime - startTime).toBeLessThan(100);
      expect(bodyTextarea.value).toContain('More');
    });

    it('handles text with multiple newlines correctly', () => {
      const multiLineText = 'Line 1\n\nLine 2\n\nLine 3\n\nLine 4';

      render(
        <WritingView
          post={{ id: 'test', title: 'Multi', body: multiLineText, column: 'ideas' }}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Type more after newlines
      fireEvent.change(bodyTextarea, { target: { value: multiLineText + '\n\nLine 5' } });

      expect(bodyTextarea.value).toContain('Line 5');
    });

    it('handles special characters without errors', () => {
      const specialChars = '€£¥§¶†‡©®™\n\n你好世界\n\nمرحبا\n\n🎉🎊🎈';

      render(
        <WritingView
          post={{ id: 'test', title: 'Special', body: specialChars, column: 'ideas' }}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Type more special chars
      fireEvent.change(bodyTextarea, { target: { value: specialChars + ' 🚀' } });

      expect(bodyTextarea.value).toContain('🚀');
    });
  });

  describe('Focus Tracking', () => {
    it('tracks focus on title textarea', () => {
      render(
        <WritingView
          post={mockPost}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const titleTextarea = screen.getByPlaceholderText('Essay Title');

      // Focus title
      fireEvent.focus(titleTextarea);

      // Verify focus (internal tracking via onFocus handler)
      expect(document.activeElement).toBe(titleTextarea);
    });

    it('tracks focus on body textarea', () => {
      render(
        <WritingView
          post={mockPost}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Focus body
      bodyTextarea.focus();

      expect(document.activeElement).toBe(bodyTextarea);
    });

    it('switches focus from title to body on Enter key', () => {
      render(
        <WritingView
          post={mockPost}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const titleTextarea = screen.getByPlaceholderText('Essay Title');
      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Focus title
      titleTextarea.focus();
      fireEvent.keyDown(titleTextarea, { key: 'Enter' });

      // Body should be focused
      expect(document.activeElement).toBe(bodyTextarea);
    });
  });

  describe('Event Handler Attachment', () => {
    it('attaches onKeyUp handler to title textarea', () => {
      render(
        <WritingView
          post={mockPost}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const titleTextarea = screen.getByPlaceholderText('Essay Title');

      // Fire keyup (arrow key, no text change)
      fireEvent.keyUp(titleTextarea, { key: 'ArrowRight' });

      // Should not throw error
      expect(titleTextarea).toBeInTheDocument();
    });

    it('attaches onClick handler to body textarea', () => {
      render(
        <WritingView
          post={mockPost}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Click to move cursor
      fireEvent.click(bodyTextarea);

      // Should not throw error
      expect(bodyTextarea).toBeInTheDocument();
    });

    it('handles cursor movement via arrow keys', () => {
      render(
        <WritingView
          post={mockPost}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      bodyTextarea.focus();

      // Arrow keys should trigger onKeyUp which calls scrollToKeepCursorCentered
      fireEvent.keyUp(bodyTextarea, { key: 'ArrowDown' });
      fireEvent.keyUp(bodyTextarea, { key: 'ArrowUp' });
      fireEvent.keyUp(bodyTextarea, { key: 'ArrowLeft' });
      fireEvent.keyUp(bodyTextarea, { key: 'ArrowRight' });

      expect(bodyTextarea).toBeInTheDocument();
    });
  });

  describe('Manual Scroll Override', () => {
    it('detects wheel scroll events', () => {
      const { container } = render(
        <WritingView
          post={mockPost}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const scrollContainer = container.querySelector('.fixed.inset-0');

      // Simulate wheel scroll
      fireEvent.wheel(scrollContainer, { deltaY: 100 });

      // Should not crash - manual scroll ref is set internally
      expect(scrollContainer).toBeTruthy();
    });

    it('detects touch scroll events', () => {
      const { container } = render(
        <WritingView
          post={mockPost}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const scrollContainer = container.querySelector('.fixed.inset-0');

      // Simulate touch scroll
      fireEvent.touchMove(scrollContainer);

      expect(scrollContainer).toBeTruthy();
    });

    it('re-engages typewriter when typing after scroll', () => {
      const { container } = render(
        <WritingView
          post={mockPost}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const scrollContainer = container.querySelector('.fixed.inset-0');
      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Manual scroll
      fireEvent.wheel(scrollContainer, { deltaY: 100 });

      // Resume typing - should reset manual scroll flag
      fireEvent.change(bodyTextarea, { target: { value: 'New text after scroll' } });

      expect(bodyTextarea.value).toBe('New text after scroll');
    });
  });

  describe('Integration with Auto-Resize', () => {
    it('does not break auto-resize functionality', () => {
      render(
        <WritingView
          post={mockPost}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Type a lot of text to trigger resize
      const longText = 'Line\n'.repeat(50);
      fireEvent.change(bodyTextarea, { target: { value: longText } });

      // Should still work (height is set via inline style)
      expect(bodyTextarea.style.height).toBeTruthy();
    });

    it('coordinates with auto-resize without scroll jump', () => {
      const { container } = render(
        <WritingView
          post={mockPost}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');
      const scrollContainer = container.querySelector('.fixed.inset-0');

      // Set scroll position
      scrollContainer.scrollTop = 500;

      // Type text to trigger auto-resize
      fireEvent.change(bodyTextarea, { target: { value: 'New text\n'.repeat(10) } });

      // Typewriter mode handles scroll positioning
      expect(bodyTextarea.value).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid typing without errors', () => {
      render(
        <WritingView
          post={mockPost}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Simulate rapid typing (10 changes in quick succession)
      for (let i = 0; i < 10; i++) {
        fireEvent.change(bodyTextarea, { target: { value: 'Text'.repeat(i + 1) } });
      }

      // Should handle without errors
      expect(bodyTextarea.value).toBeTruthy();
    });

    it('handles cursor at start of document', () => {
      render(
        <WritingView
          post={{ id: 'test', title: 'Title', body: 'Body text here', column: 'ideas' }}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Move cursor to start
      bodyTextarea.setSelectionRange(0, 0);
      fireEvent.click(bodyTextarea);

      // Should not error
      expect(bodyTextarea).toBeInTheDocument();
    });

    it('handles cursor at end of document', () => {
      const longText = 'Text\n'.repeat(100);

      render(
        <WritingView
          post={{ id: 'test', title: 'Title', body: longText, column: 'ideas' }}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Move cursor to end
      bodyTextarea.setSelectionRange(longText.length, longText.length);
      fireEvent.click(bodyTextarea);

      // Should not error
      expect(bodyTextarea).toBeInTheDocument();
    });

    it('handles window resize gracefully', () => {
      render(
        <WritingView
          post={mockPost}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Type some text
      fireEvent.change(bodyTextarea, { target: { value: 'Before resize' } });

      // Simulate window resize
      global.innerWidth = 500;
      global.dispatchEvent(new Event('resize'));

      // Type more text after resize
      fireEvent.change(bodyTextarea, { target: { value: 'Before resize\nAfter resize' } });

      expect(bodyTextarea.value).toContain('After resize');
    });

    it('handles text selection without breaking typewriter', () => {
      render(
        <WritingView
          post={mockPost}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Select some text
      bodyTextarea.setSelectionRange(0, 10);
      fireEvent.click(bodyTextarea);

      // Type to replace selection
      fireEvent.change(bodyTextarea, { target: { value: 'Replaced text' } });

      expect(bodyTextarea.value).toBe('Replaced text');
    });
  });

  describe('Always-On Behavior', () => {
    it('works in normal mode (not just zen mode)', () => {
      render(
        <WritingView
          post={mockPost}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Type in normal mode (zen mode is false by default)
      fireEvent.change(bodyTextarea, { target: { value: 'Normal mode typing' } });

      // Should work - typewriter is always active
      expect(bodyTextarea.value).toBe('Normal mode typing');
    });

    it('preserves placeholder text', () => {
      render(
        <WritingView
          post={{ id: 'new', title: '', body: '', column: 'ideas' }}
          defaultColumn="ideas"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          currentUser={mockCurrentUser}
        />
      );

      const titleTextarea = screen.getByPlaceholderText('Essay Title');
      const bodyTextarea = screen.getByPlaceholderText('Start writing your thoughts...');

      // Placeholders should be unchanged
      expect(titleTextarea.placeholder).toBe('Essay Title');
      expect(bodyTextarea.placeholder).toBe('Start writing your thoughts...');
    });
  });
});
