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

const mockPost = {
  id: 'post-abc123',
  title: 'Test post',
  body: 'Some body text',
  column: 'ideas',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

function setupInstantDB(overrides = {}) {
  const defaults = {
    useAuth: () => ({ user: mockUser }),
    useQuery: () => ({
      isLoading: false,
      error: null,
      data: {
        $users: [{
          id: mockUser.id,
          posts: [mockPost],
        }],
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
    const { result } = renderHook(() => useKanban());

    expect(result.current.loading).toBe(false);
    expect(result.current.posts).toEqual([mockPost]);
  });

  it('shows loading=true while InstantDB query is loading', () => {
    setupInstantDB({
      useQuery: () => ({
        isLoading: true,
        error: null,
        data: null,
      }),
    });
    const { result } = renderHook(() => useKanban());

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
    const { result } = renderHook(() => useKanban());

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
          $users: [{
            id: mockUser.id,
            posts: [],
          }],
        },
      }),
    });
    const { result } = renderHook(() => useKanban());

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
    const { result } = renderHook(() => useKanban());

    expect(result.current.posts).toEqual([]);
  });
});

describe('useKanban — createPost', () => {
  it('creates a post with title, body, and column', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban());

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
  });

  it('trims title and body whitespace', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban());

    await act(async () => {
      await result.current.createPost('  padded  ', '  body  ');
    });

    const txArray = db.transact.mock.calls[0][0];
    expect(txArray[0].data.title).toBe('padded');
    expect(txArray[0].data.body).toBe('body');
  });

  it('defaults to "ideas" column when not specified', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban());

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
    const { result } = renderHook(() => useKanban());

    await act(async () => {
      const created = await result.current.createPost('Title', 'Body');
      expect(created).toBeUndefined();
    });

    expect(db.transact).not.toHaveBeenCalled();
  });

  it('sets createdAt and updatedAt timestamps', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban());
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
});

describe('useKanban — updatePost', () => {
  it('updates a post with new data', async () => {
    setupInstantDB();
    const { result } = renderHook(() => useKanban());

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
    const { result } = renderHook(() => useKanban());

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
    const { result } = renderHook(() => useKanban());
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
    const { result } = renderHook(() => useKanban());

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
    const { result } = renderHook(() => useKanban());

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
    const { result } = renderHook(() => useKanban());

    await act(async () => {
      await result.current.deletePost('post-abc123');
    });

    expect(db.transact).toHaveBeenCalledOnce();
    const tx = db.transact.mock.calls[0][0];
    expect(tx.type).toBe('delete');
    expect(tx.postId).toBe('post-abc123');
  });
});
