import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCoach } from '../useCoach';

// Helper: build a post with updatedAt offset from now
function makePost(overrides = {}) {
  const daysAgo = overrides.daysAgo ?? 0;
  const updatedAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
  return {
    id: overrides.id ?? 'p1',
    title: overrides.title ?? 'Test post',
    body: overrides.body ?? '',
    column: overrides.column ?? 'ideas',
    createdAt: updatedAt,
    updatedAt,
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

// ── getTier ────────────────────────────────────────────────────────────────────

describe('useCoach — getTier', () => {
  it('returns null for a post updated 2 days ago', () => {
    const posts = [makePost({ daysAgo: 2 })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.getTier('p1')).toBeNull();
  });

  it('returns null for a fresh post (0 days)', () => {
    const posts = [makePost({ daysAgo: 0 })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.getTier('p1')).toBeNull();
  });

  it('returns mild for a post updated exactly 3 days ago', () => {
    const posts = [makePost({ daysAgo: 3 })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.getTier('p1')).toBe('mild');
  });

  it('returns mild for a post updated 5 days ago', () => {
    const posts = [makePost({ daysAgo: 5 })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.getTier('p1')).toBe('mild');
  });

  it('returns urgent for a post updated exactly 6 days ago', () => {
    const posts = [makePost({ daysAgo: 6 })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.getTier('p1')).toBe('urgent');
  });

  it('returns urgent for a post updated 7 days ago', () => {
    const posts = [makePost({ daysAgo: 7 })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.getTier('p1')).toBe('urgent');
  });

  it('returns finalized-stuck for a finalized post 3+ days idle (over mild)', () => {
    const posts = [makePost({ daysAgo: 3, column: 'finalized' })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.getTier('p1')).toBe('finalized-stuck');
  });

  it('returns finalized-stuck for a finalized post 7 days idle (over urgent)', () => {
    const posts = [makePost({ daysAgo: 7, column: 'finalized' })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.getTier('p1')).toBe('finalized-stuck');
  });

  it('returns null for a finalized post updated 1 day ago', () => {
    const posts = [makePost({ daysAgo: 1, column: 'finalized' })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.getTier('p1')).toBeNull();
  });

  it('returns null for an unknown post id', () => {
    const posts = [makePost({ daysAgo: 10 })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.getTier('unknown-id')).toBeNull();
  });

  it('returns null for a snoozed post (snooze not expired)', () => {
    const expiry = new Date(Date.now() + 3 * 86400000).toISOString();
    localStorage.setItem('coach_snooze_p1', expiry);
    const posts = [makePost({ daysAgo: 7 })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.getTier('p1')).toBeNull();
  });

  it('returns correct tier for a snoozed post after expiry', () => {
    const expired = new Date(Date.now() - 1 * 86400000).toISOString();
    localStorage.setItem('coach_snooze_p1', expired);
    const posts = [makePost({ daysAgo: 7 })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.getTier('p1')).toBe('urgent');
  });

  it('handles corrupted updatedAt gracefully (returns null)', () => {
    const posts = [{ ...makePost(), updatedAt: 'not-a-date' }];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.getTier('p1')).toBeNull();
  });
});

// ── staleCards ─────────────────────────────────────────────────────────────────

describe('useCoach — staleCards', () => {
  it('excludes fresh posts', () => {
    const posts = [makePost({ id: 'fresh', daysAgo: 1 })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.staleCards).toHaveLength(0);
  });

  it('includes stale posts', () => {
    const posts = [
      makePost({ id: 'fresh', daysAgo: 1 }),
      makePost({ id: 'stale', daysAgo: 5 }),
    ];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.staleCards).toHaveLength(1);
    expect(result.current.staleCards[0].id).toBe('stale');
  });

  it('excludes snoozed posts', () => {
    const expiry = new Date(Date.now() + 3 * 86400000).toISOString();
    localStorage.setItem('coach_snooze_stale', expiry);
    const posts = [makePost({ id: 'stale', daysAgo: 7 })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.staleCards).toHaveLength(0);
  });
});

// ── topNudges ──────────────────────────────────────────────────────────────────

describe('useCoach — topNudges sort order', () => {
  it('sorts finalized-stuck before urgent before mild', () => {
    const posts = [
      makePost({ id: 'mild', daysAgo: 4, column: 'ideas' }),
      makePost({ id: 'urgent', daysAgo: 7, column: 'drafts' }),
      makePost({ id: 'finalized', daysAgo: 5, column: 'finalized' }),
    ];
    const { result } = renderHook(() => useCoach(posts));
    const ids = result.current.topNudges.map(p => p.id);
    expect(ids[0]).toBe('finalized');
    expect(ids[1]).toBe('urgent');
    expect(ids[2]).toBe('mild');
  });

  it('returns at most 3 nudges', () => {
    const posts = Array.from({ length: 6 }, (_, i) =>
      makePost({ id: `p${i}`, daysAgo: 7 })
    );
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.topNudges).toHaveLength(3);
  });

  it('returns fewer than 3 when fewer are stale', () => {
    const posts = [makePost({ daysAgo: 5 })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.topNudges).toHaveLength(1);
  });
});

// ── snooze ─────────────────────────────────────────────────────────────────────

describe('useCoach — snooze', () => {
  it('writes a localStorage key with correct expiry on snooze(id, 3)', () => {
    const before = Date.now();
    const posts = [makePost({ daysAgo: 7 })];
    const { result } = renderHook(() => useCoach(posts));

    act(() => {
      result.current.snooze('p1', 3);
    });

    const raw = localStorage.getItem('coach_snooze_p1');
    expect(raw).not.toBeNull();
    const expiry = new Date(raw).getTime();
    const expectedMin = before + 3 * 86400000 - 1000;
    const expectedMax = before + 3 * 86400000 + 1000;
    expect(expiry).toBeGreaterThanOrEqual(expectedMin);
    expect(expiry).toBeLessThanOrEqual(expectedMax);
  });

  it('removes snoozed post from staleCards immediately', () => {
    const posts = [makePost({ daysAgo: 7 })];
    const { result } = renderHook(() => useCoach(posts));

    expect(result.current.staleCards).toHaveLength(1);
    act(() => {
      result.current.snooze('p1', 3);
    });
    expect(result.current.staleCards).toHaveLength(0);
  });

  it('getTier returns null immediately after snooze', () => {
    const posts = [makePost({ daysAgo: 7 })];
    const { result } = renderHook(() => useCoach(posts));

    act(() => {
      result.current.snooze('p1', 7);
    });
    expect(result.current.getTier('p1')).toBeNull();
  });

  it('loads existing snooze keys from localStorage on mount', () => {
    const expiry = new Date(Date.now() + 7 * 86400000).toISOString();
    localStorage.setItem('coach_snooze_p1', expiry);
    const posts = [makePost({ daysAgo: 7 })];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.getTier('p1')).toBeNull();
    expect(result.current.staleCards).toHaveLength(0);
  });
});
