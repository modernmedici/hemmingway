import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useKanban } from '../useKanban';

// Mock InstantDB
vi.mock('../../lib/db', () => ({
  default: {
    useAuth: vi.fn(),
    useQuery: vi.fn(),
    transact: vi.fn(),
    tx: {
      posts: new Proxy({}, {
        get: (target, postId) => ({
          update: vi.fn((data) => ({ type: 'update', postId, data })),
          delete: vi.fn(() => ({ type: 'delete', postId })),
          link: vi.fn((link) => ({ type: 'link', postId, link })),
        }),
      }),
    },
  },
}));

// Mock @instantdb/react id generator
vi.mock('@instantdb/react', () => ({
  id: vi.fn(() => 'generated-id-' + Math.random().toString(36).substr(2, 9)),
}));

import db from '../../lib/db';
import { id } from '@instantdb/react';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockBoardId = 'board-xyz789';

const mockPost = {
  id: 'post-abc123',
  title: 'Test post',
  body: 'Some body text',
  column: 'ideas',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const mockBoard = {
  id: mockBoardId,
  name: 'Test Board',
  posts: [mockPost],
  members: [],
  owner: mockUser,
};

function setupInstantDB(overrides = {}) {
  const defaults = {
    useAuth: () => ({ user: mockUser }),
    useQuery: () => ({
      isLoading: false,
      error: null,
      data: {
        boards: [mockBoard],
      },
    }),
    transact: vi.fn().mockResolvedValue(undefined),
  };

  Object.assign(db, { ...defaults, ...overrides });
}

beforeEach(() => {
  vi.clearAllMocks();
  setupInstantDB();
});

describe('useKanban — loading', () => {
  it('loads posts from InstantDB on mount', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    expect(result.current.loading).toBe(false);
    expect(result.current.posts).toEqual([mockPost]);
    expect(result.current.board).toEqual(mockBoard);
  });

  it('shows loading=true while InstantDB query is loading', () => {
    setupInstantDB({
      useQuery: () => ({
        isLoading: true,
        error: null,
        data: null,
      }),
    });
    const { result } = renderHook(() => useKanban(mockBoardId));

    expect(result.current.loading).toBe(true);
    expect(result.current.posts).toEqual([]);
  });

  it('handles query errors gracefully', () => {
    setupInstantDB({
      useQuery: () => ({
        isLoading: false,
        error: { message: 'Network error' },
        data: null,
      }),
    });
    const { result } = renderHook(() => useKanban(mockBoardId));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Network error');
    expect(result.current.posts).toEqual([]);
  });

  it('returns empty array when user has no posts', () => {
    setupInstantDB({
      useQuery: () => ({
        isLoading: false,
        error: null,
        data: {
          boards: [{
            ...mockBoard,
            posts: [],
          }],
        },
      }),
    });
    const { result } = renderHook(() => useKanban(mockBoardId));

    expect(result.current.posts).toEqual([]);
  });

  it('returns empty array when user is not authenticated', () => {
    setupInstantDB({
      useAuth: () => ({ user: null }),
      useQuery: () => ({
        isLoading: false,
        error: null,
        data: null,
      }),
    });
    const { result } = renderHook(() => useKanban(mockBoardId));

    expect(result.current.posts).toEqual([]);
  });
});

describe('useKanban — createPost', () => {
  it('creates a post with title, body, and column', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      const created = await result.current.createPost('My idea', 'body text', 'ideas');
      expect(created.id).toMatch(/^generated-id-/);
    });

    expect(db.transact).toHaveBeenCalledOnce();
    const txArray = db.transact.mock.calls[0][0];
    expect(txArray).toHaveLength(2);
    expect(txArray[0].type).toBe('update');
    expect(txArray[0].data.title).toBe('My idea');
    expect(txArray[0].data.body).toBe('body text');
    expect(txArray[0].data.column).toBe('ideas');
    expect(txArray[1].type).toBe('link');
    expect(txArray[1].link.creator).toBe(mockUser.id);
    expect(txArray[1].link.board).toBe(mockBoardId);
  });

  it('trims title and body whitespace', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      await result.current.createPost('  padded  ', '  body  ');
    });

    const txArray = db.transact.mock.calls[0][0];
    expect(txArray[0].data.title).toBe('padded');
    expect(txArray[0].data.body).toBe('body');
  });

  it('defaults to "ideas" column when not specified', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      await result.current.createPost('Title', 'Body');
    });

    const txArray = db.transact.mock.calls[0][0];
    expect(txArray[0].data.column).toBe('ideas');
  });

  it('does nothing when user is not authenticated', async () => {
    setupInstantDB({
      useAuth: () => ({ user: null }),
    });
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      const created = await result.current.createPost('Title', 'Body');
      expect(created).toBeUndefined();
    });

    expect(db.transact).not.toHaveBeenCalled();
  });

  it('sets createdAt and updatedAt timestamps', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));
    const beforeCreate = Date.now();

    await act(async () => {
      await result.current.createPost('Title', 'Body');
    });

    const txArray = db.transact.mock.calls[0][0];
    const createdAt = txArray[0].data.createdAt.getTime();
    const updatedAt = txArray[0].data.updatedAt.getTime();

    expect(createdAt).toBeGreaterThanOrEqual(beforeCreate);
    expect(createdAt).toBeLessThanOrEqual(Date.now());
    expect(updatedAt).toBe(createdAt);
  });

  // Edge cases
  it('handles empty title and body (after trimming)', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      await result.current.createPost('   ', '   ');
    });

    const txArray = db.transact.mock.calls[0][0];
    expect(txArray[0].data.title).toBe('');
    expect(txArray[0].data.body).toBe('');
  });

  it('handles very long title (>1000 chars)', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));
    const longTitle = 'A'.repeat(1500);

    await act(async () => {
      await result.current.createPost(longTitle, 'Body');
    });

    const txArray = db.transact.mock.calls[0][0];
    expect(txArray[0].data.title).toBe(longTitle);
  });

  it('handles special characters in title and body', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));
    const specialChars = '<script>alert("xss")</script> & "quotes" \' and 中文';

    await act(async () => {
      await result.current.createPost(specialChars, specialChars);
    });

    const txArray = db.transact.mock.calls[0][0];
    expect(txArray[0].data.title).toBe(specialChars);
    expect(txArray[0].data.body).toBe(specialChars);
  });

  it('handles undefined column gracefully', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      await result.current.createPost('Title', 'Body', undefined);
    });

    const txArray = db.transact.mock.calls[0][0];
    expect(txArray[0].data.column).toBe('ideas');
  });
});

describe('useKanban — updatePost', () => {
  it('updates a post with new data', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      await result.current.updatePost('post-abc123', { title: 'Updated title' });
    });

    expect(db.transact).toHaveBeenCalledOnce();
    const tx = db.transact.mock.calls[0][0];
    expect(tx.type).toBe('update');
    expect(tx.postId).toBe('post-abc123');
    expect(tx.data.title).toBe('Updated title');
    expect(tx.data.updatedAt).toBeInstanceOf(Date);
  });

  it('can update multiple fields at once', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      await result.current.updatePost('post-abc123', {
        title: 'New title',
        body: 'New body',
        column: 'drafts',
      });
    });

    const tx = db.transact.mock.calls[0][0];
    expect(tx.data.title).toBe('New title');
    expect(tx.data.body).toBe('New body');
    expect(tx.data.column).toBe('drafts');
  });

  it('always updates updatedAt timestamp', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));
    const beforeUpdate = Date.now();

    await act(async () => {
      await result.current.updatePost('post-abc123', { title: 'Updated' });
    });

    const tx = db.transact.mock.calls[0][0];
    const updatedAt = tx.data.updatedAt.getTime();
    expect(updatedAt).toBeGreaterThanOrEqual(beforeUpdate);
    expect(updatedAt).toBeLessThanOrEqual(Date.now());
  });
});

describe('useKanban — movePost', () => {
  it('moves a post to a new column', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      await result.current.movePost('post-abc123', 'drafts');
    });

    expect(db.transact).toHaveBeenCalledOnce();
    const tx = db.transact.mock.calls[0][0];
    expect(tx.type).toBe('update');
    expect(tx.postId).toBe('post-abc123');
    expect(tx.data.column).toBe('drafts');
    expect(tx.data.updatedAt).toBeInstanceOf(Date);
  });

  it('can move to any column (ideas, drafts, finalized)', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    for (const column of ['ideas', 'drafts', 'finalized']) {
      await act(async () => {
        await result.current.movePost('post-abc123', column);
      });

      const tx = db.transact.mock.calls[db.transact.mock.calls.length - 1][0];
      expect(tx.data.column).toBe(column);
    }
  });
});

describe('useKanban — deletePost', () => {
  it('deletes a post by id', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      await result.current.deletePost('post-abc123');
    });

    expect(db.transact).toHaveBeenCalledOnce();
    const tx = db.transact.mock.calls[0][0];
    expect(tx.type).toBe('delete');
    expect(tx.postId).toBe('post-abc123');
  });
});

describe('useKanban — server error handling', () => {
  it('throws user-friendly error when createPost transact fails', async () => {
    setupInstantDB({
      transact: vi.fn().mockRejectedValue(new Error('Network timeout')),
    });
    const { result } = renderHook(() => useKanban(mockBoardId));

    await expect(async () => {
      await act(async () => {
        await result.current.createPost('Title', 'Body');
      });
    }).rejects.toThrow('Failed to create post. Check your connection and try again.');
  });

  it('throws user-friendly error when updatePost transact fails', async () => {
    setupInstantDB({
      transact: vi.fn().mockRejectedValue(new Error('Server error')),
    });
    const { result } = renderHook(() => useKanban(mockBoardId));

    await expect(async () => {
      await act(async () => {
        await result.current.updatePost('post-abc123', { title: 'New' });
      });
    }).rejects.toThrow('Failed to update post. Check your connection and try again.');
  });

  it('throws user-friendly error when movePost transact fails', async () => {
    setupInstantDB({
      transact: vi.fn().mockRejectedValue(new Error('Permission denied')),
    });
    const { result } = renderHook(() => useKanban(mockBoardId));

    await expect(async () => {
      await act(async () => {
        await result.current.movePost('post-abc123', 'drafts');
      });
    }).rejects.toThrow('Failed to move card. Check your connection and try again.');
  });

  it('throws user-friendly error when deletePost transact fails', async () => {
    setupInstantDB({
      transact: vi.fn().mockRejectedValue(new Error('Delete failed')),
    });
    const { result } = renderHook(() => useKanban(mockBoardId));

    await expect(async () => {
      await act(async () => {
        await result.current.deletePost('post-abc123');
      });
    }).rejects.toThrow('Failed to delete post. Check your connection and try again.');
  });

  it('logs original error to console while throwing user-friendly message', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const originalError = new Error('InstantDB connection lost');
    setupInstantDB({
      transact: vi.fn().mockRejectedValue(originalError),
    });
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      try {
        await result.current.createPost('Title', 'Body');
      } catch (err) {
        // Expected to throw user-friendly error
      }
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create post:', originalError);
    consoleErrorSpy.mockRestore();
  });
});

describe('useKanban — concurrent operations', () => {
  it('handles multiple createPost calls in parallel', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      await Promise.all([
        result.current.createPost('Post 1', 'Body 1'),
        result.current.createPost('Post 2', 'Body 2'),
        result.current.createPost('Post 3', 'Body 3'),
      ]);
    });

    expect(db.transact).toHaveBeenCalledTimes(3);
    const titles = db.transact.mock.calls.map(call => call[0][0].data.title);
    expect(titles).toEqual(['Post 1', 'Post 2', 'Post 3']);
  });

  it('handles mixed operations (create, update, delete) in parallel', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      await Promise.all([
        result.current.createPost('New', 'Body'),
        result.current.updatePost('post-abc123', { title: 'Updated' }),
        result.current.deletePost('post-xyz789'),
      ]);
    });

    expect(db.transact).toHaveBeenCalledTimes(3);
    const operations = db.transact.mock.calls.map(call => {
      const tx = Array.isArray(call[0]) ? call[0][0] : call[0];
      return tx.type;
    });
    expect(operations).toContain('update');
    expect(operations).toContain('delete');
  });

  it('continues with successful operations when one fails', async () => {
    let callCount = 0;
    setupInstantDB({
      transact: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.reject(new Error('Second operation failed'));
        }
        return Promise.resolve();
      }),
    });
    const { result } = renderHook(() => useKanban(mockBoardId));

    const results = await act(async () => {
      return await Promise.allSettled([
        result.current.createPost('Post 1', 'Body 1'),
        result.current.createPost('Post 2', 'Body 2'),
        result.current.createPost('Post 3', 'Body 3'),
      ]);
    });

    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('rejected');
    expect(results[1].reason.message).toBe('Failed to create post. Check your connection and try again.');
    expect(results[2].status).toBe('fulfilled');
  });

  // Duplicate submission test (note: no built-in dedup in useKanban)
  it('allows double-submit when createPost called twice rapidly', async () => {
    let resolveFirst;
    const firstPromise = new Promise(resolve => { resolveFirst = resolve; });
    let callCount = 0;

    setupInstantDB({
      transact: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return firstPromise; // First call waits
        }
        return Promise.resolve(); // Second call resolves immediately
      }),
    });

    const { result } = renderHook(() => useKanban(mockBoardId));

    // Simulate rapid double-tap on mobile
    const promise1 = act(async () => {
      return result.current.createPost('Title', 'Body');
    });

    const promise2 = act(async () => {
      return result.current.createPost('Title', 'Body');
    });

    // Resolve first call
    resolveFirst();
    await promise1;
    await promise2;

    // Both calls should have gone through (no built-in dedup in useKanban)
    expect(db.transact).toHaveBeenCalledTimes(2);
  });
});

