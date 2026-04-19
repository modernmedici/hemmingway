import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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

vi.mock('@instantdb/react', () => ({
  id: vi.fn(() => 'generated-id-' + Math.random().toString(36).substr(2, 9)),
}));

import db from '../../lib/db';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockBoardId = 'board-xyz789';

const mockPosts = [
  {
    id: 'post-1',
    title: 'First',
    body: 'Body 1',
    column: 'ideas',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'post-2',
    title: 'Second',
    body: 'Body 2',
    column: 'ideas',
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'post-3',
    title: 'Third',
    body: 'Body 3',
    column: 'ideas',
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockBoard = {
  id: mockBoardId,
  name: 'Test Board',
  posts: mockPosts,
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

describe('useKanban — position-aware reordering', () => {
  it('moves post to specific index in same column', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    // Move post-3 (index 2) to index 0
    await act(async () => {
      await result.current.movePost('post-3', 'ideas', 0);
    });

    expect(db.transact).toHaveBeenCalledOnce();
    const transactions = db.transact.mock.calls[0][0];

    // Should reorder all posts in column
    expect(transactions).toHaveLength(3);

    // post-3 should be at index 0
    const post3Update = transactions.find(tx => tx.postId === 'post-3');
    expect(post3Update.data.order).toBe(0);

    // post-1 should be at index 1
    const post1Update = transactions.find(tx => tx.postId === 'post-1');
    expect(post1Update.data.order).toBe(1);

    // post-2 should be at index 2
    const post2Update = transactions.find(tx => tx.postId === 'post-2');
    expect(post2Update.data.order).toBe(2);
  });

  it('moves post to different column at specific index', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    // Move post-1 from ideas to drafts at index 0
    await act(async () => {
      await result.current.movePost('post-1', 'drafts', 0);
    });

    const transactions = db.transact.mock.calls[0][0];

    // Should have moved post update + source column reorder
    expect(transactions.length).toBeGreaterThan(0);

    const post1Update = transactions.find(tx => tx.postId === 'post-1');
    expect(post1Update.data.column).toBe('drafts');
    expect(post1Update.data.order).toBe(0);
    expect(post1Update.data.updatedAt).toBeInstanceOf(Date); // Column change updates timestamp
  });

  it('reorders source column when moving to different column', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    // Move post-2 from ideas to drafts
    await act(async () => {
      await result.current.movePost('post-2', 'drafts', 0);
    });

    const transactions = db.transact.mock.calls[0][0];

    // Should have updates for post-2 (moved), post-1 and post-3 (reordered in ideas)
    expect(transactions.length).toBeGreaterThan(1);

    // Remaining posts in ideas should be reordered (post-1 at 0, post-3 at 1)
    const post1Update = transactions.find(tx => tx.postId === 'post-1');
    const post3Update = transactions.find(tx => tx.postId === 'post-3');

    expect(post1Update.data.order).toBe(0);
    expect(post3Update.data.order).toBe(1);
  });

  it('does not update timestamp when reordering within same column', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      await result.current.movePost('post-1', 'ideas', 2);
    });

    const transactions = db.transact.mock.calls[0][0];

    // Find post-2 and post-3 updates (not the moved post)
    const post2Update = transactions.find(tx => tx.postId === 'post-2');
    const post3Update = transactions.find(tx => tx.postId === 'post-3');

    // These posts are just reordered, not moved, so no updatedAt
    expect(post2Update?.data.updatedAt).toBeUndefined();
    expect(post3Update?.data.updatedAt).toBeUndefined();
  });

  it('falls back to append behavior when targetIndex is undefined', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    // Call without targetIndex (old API)
    await act(async () => {
      await result.current.movePost('post-1', 'drafts');
    });

    const tx = db.transact.mock.calls[0][0];
    expect(tx.type).toBe('update');
    expect(tx.data.column).toBe('drafts');
    expect(tx.data.order).toBeGreaterThan(0); // Should be max + 1
  });

  it('handles moving to empty column', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      await result.current.movePost('post-1', 'finalized', 0);
    });

    const transactions = db.transact.mock.calls[0][0];
    const post1Update = transactions.find(tx => tx.postId === 'post-1');

    expect(post1Update.data.column).toBe('finalized');
    expect(post1Update.data.order).toBe(0);
  });

  it('sorts posts by order on load', () => {
    const unsortedPosts = [
      { ...mockPosts[0], order: 2 },
      { ...mockPosts[1], order: 0 },
      { ...mockPosts[2], order: 1 },
    ];

    setupInstantDB({
      useQuery: () => ({
        isLoading: false,
        error: null,
        data: {
          boards: [{
            ...mockBoard,
            posts: unsortedPosts,
          }],
        },
      }),
    });

    const { result } = renderHook(() => useKanban(mockBoardId));

    // Should be sorted by order
    expect(result.current.posts[0].order).toBe(0);
    expect(result.current.posts[1].order).toBe(1);
    expect(result.current.posts[2].order).toBe(2);
  });
});

describe('useKanban — error handling', () => {
  it('throws descriptive error on createPost failure', async () => {
    setupInstantDB({
      transact: vi.fn().mockRejectedValue(new Error('Network error')),
    });

    const { result } = renderHook(() => useKanban(mockBoardId));

    await expect(
      act(async () => {
        await result.current.createPost('Title', 'Body');
      })
    ).rejects.toThrow('Failed to create post. Check your connection and try again.');
  });

  it('throws descriptive error on updatePost failure', async () => {
    setupInstantDB({
      transact: vi.fn().mockRejectedValue(new Error('Network error')),
    });

    const { result } = renderHook(() => useKanban(mockBoardId));

    await expect(
      act(async () => {
        await result.current.updatePost('post-1', { title: 'Updated' });
      })
    ).rejects.toThrow('Failed to update post. Check your connection and try again.');
  });

  it('throws descriptive error on movePost failure', async () => {
    setupInstantDB({
      transact: vi.fn().mockRejectedValue(new Error('Network error')),
    });

    const { result } = renderHook(() => useKanban(mockBoardId));

    await expect(
      act(async () => {
        await result.current.movePost('post-1', 'drafts', 0);
      })
    ).rejects.toThrow('Failed to move card. Check your connection and try again.');
  });

  it('throws descriptive error on deletePost failure', async () => {
    setupInstantDB({
      transact: vi.fn().mockRejectedValue(new Error('Network error')),
    });

    const { result } = renderHook(() => useKanban(mockBoardId));

    await expect(
      act(async () => {
        await result.current.deletePost('post-1');
      })
    ).rejects.toThrow('Failed to delete post. Check your connection and try again.');
  });

  it('returns early when post not found in movePost', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban(mockBoardId));

    await act(async () => {
      await result.current.movePost('nonexistent-id', 'drafts', 0);
    });

    // Should not call transact if post not found
    expect(db.transact).not.toHaveBeenCalled();
  });
});
