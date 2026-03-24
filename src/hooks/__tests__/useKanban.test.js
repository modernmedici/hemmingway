import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useKanban } from '../useKanban';

const mockPost = {
  id: 'abc123',
  title: 'Test post',
  body: 'Some body text',
  column: 'ideas',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  publishedTo: [],
};

function setupApi(overrides = {}) {
  vi.stubGlobal('api', {
    posts: {
      list: vi.fn().mockResolvedValue([mockPost]),
      save: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      ...overrides,
    },
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useKanban — loading', () => {
  it('loads posts from the file system on mount', async () => {
    setupApi();
    const { result } = renderHook(() => useKanban());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.posts).toEqual([mockPost]);
    expect(window.api.posts.list).toHaveBeenCalledOnce();
  });

  it('sets loading=false and posts=[] when list fails', async () => {
    setupApi({ list: vi.fn().mockRejectedValue(new Error('disk error')) });
    const { result } = renderHook(() => useKanban());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.posts).toEqual([]);
  });
});

describe('useKanban — createPost', () => {
  it('saves to disk before updating state', async () => {
    setupApi({ list: vi.fn().mockResolvedValue([]) });
    const { result } = renderHook(() => useKanban());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createPost('My idea', 'body text', 'ideas');
    });

    expect(window.api.posts.save).toHaveBeenCalledOnce();
    const saved = window.api.posts.save.mock.calls[0][0];
    expect(saved.title).toBe('My idea');
    expect(saved.column).toBe('ideas');
    expect(result.current.posts).toHaveLength(1);
  });

  it('trims title and body whitespace', async () => {
    setupApi({ list: vi.fn().mockResolvedValue([]) });
    const { result } = renderHook(() => useKanban());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createPost('  padded  ', '  body  ');
    });

    const saved = window.api.posts.save.mock.calls[0][0];
    expect(saved.title).toBe('padded');
    expect(saved.body).toBe('body');
  });
});

describe('useKanban — updatePost', () => {
  it('saves the updated post to disk', async () => {
    setupApi();
    const { result } = renderHook(() => useKanban());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updatePost('abc123', { title: 'Updated title' });
    });

    expect(window.api.posts.save).toHaveBeenCalledOnce();
    const saved = window.api.posts.save.mock.calls[0][0];
    expect(saved.title).toBe('Updated title');
    expect(saved.body).toBe('Some body text'); // unchanged fields preserved
    expect(saved.updatedAt).not.toBe(mockPost.updatedAt); // timestamp bumped
  });

  it('updates state even if the post id is not found', async () => {
    setupApi();
    const { result } = renderHook(() => useKanban());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updatePost('nonexistent', { title: 'x' });
    });

    // posts unchanged, no save called
    expect(window.api.posts.save).not.toHaveBeenCalled();
    expect(result.current.posts[0].title).toBe('Test post');
  });
});

describe('useKanban — movePost', () => {
  it('saves with the new column to disk', async () => {
    setupApi();
    const { result } = renderHook(() => useKanban());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.movePost('abc123', 'drafts');
    });

    expect(window.api.posts.save).toHaveBeenCalledOnce();
    const saved = window.api.posts.save.mock.calls[0][0];
    expect(saved.column).toBe('drafts');
    expect(result.current.posts[0].column).toBe('drafts');
  });
});

describe('useKanban — deletePost', () => {
  it('calls delete IPC and removes post from state', async () => {
    setupApi();
    const { result } = renderHook(() => useKanban());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deletePost('abc123');
    });

    expect(window.api.posts.delete).toHaveBeenCalledWith('abc123');
    expect(result.current.posts).toHaveLength(0);
  });
});
