import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCoach } from '../useCoach';

// Fixed reference time so tests don't depend on wall-clock
const NOW = new Date('2026-01-15T12:00:00Z');
const daysAgo = (n) => new Date(NOW.getTime() - n * 86400000).toISOString();

const makePost = (overrides = {}) => ({
  id: 'post-1',
  title: 'Test post',
  body: 'Some content',
  column: 'ideas',
  updatedAt: daysAgo(0),
  ...overrides,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

// ─── computeTier (via getTier) ──────────────────────────────────────────────

describe('computeTier', () => {
  it('mild — idea with body idle 3+ days', () => {
    const post = makePost({ updatedAt: daysAgo(4) });
    const { result } = renderHook(() => useCoach([post]));
    expect(result.current.getTier('post-1')).toBe('mild');
  });

  it('mild — idea with empty body idle 2+ days', () => {
    const post = makePost({ body: '', updatedAt: daysAgo(2) });
    const { result } = renderHook(() => useCoach([post]));
    expect(result.current.getTier('post-1')).toBe('mild');
  });

  it('urgent — post idle 6+ days', () => {
    const post = makePost({ updatedAt: daysAgo(7) });
    const { result } = renderHook(() => useCoach([post]));
    expect(result.current.getTier('post-1')).toBe('urgent');
  });

  it('finalized-stuck — finalized column idle 3+ days', () => {
    const post = makePost({ column: 'finalized', updatedAt: daysAgo(4) });
    const { result } = renderHook(() => useCoach([post]));
    expect(result.current.getTier('post-1')).toBe('finalized-stuck');
  });

  it('null — fresh post (0 days idle)', () => {
    const post = makePost({ updatedAt: daysAgo(0) });
    const { result } = renderHook(() => useCoach([post]));
    expect(result.current.getTier('post-1')).toBeNull();
  });

  it('null — snoozed card (reads coach_snooze_${id} from localStorage)', () => {
    const post = makePost({ updatedAt: daysAgo(7) });
    const expiry = new Date(NOW.getTime() + 86400000).toISOString();
    localStorage.setItem('coach_snooze_post-1', expiry);
    const { result } = renderHook(() => useCoach([post]));
    expect(result.current.getTier('post-1')).toBeNull();
  });

  it('null — finalized-stuck card that is also snoozed (snooze wins)', () => {
    const post = makePost({ column: 'finalized', updatedAt: daysAgo(5) });
    const expiry = new Date(NOW.getTime() + 86400000).toISOString();
    localStorage.setItem('coach_snooze_post-1', expiry);
    const { result } = renderHook(() => useCoach([post]));
    expect(result.current.getTier('post-1')).toBeNull();
  });
});

// ─── snooze ─────────────────────────────────────────────────────────────────

describe('snooze', () => {
  it('writes coach_snooze_${id} to localStorage with correct expiry timestamp', () => {
    const post = makePost({ updatedAt: daysAgo(7) });
    const { result } = renderHook(() => useCoach([post]));

    act(() => {
      result.current.snooze('post-1', 3);
    });

    const stored = localStorage.getItem('coach_snooze_post-1');
    expect(stored).not.toBeNull();
    const storedExpiry = new Date(stored).getTime();
    const expectedExpiry = NOW.getTime() + 3 * 86400000;
    expect(Math.abs(storedExpiry - expectedExpiry)).toBeLessThan(1000);
  });

  it('snoozed card reads back on re-render and shows as null tier', () => {
    const post = makePost({ updatedAt: daysAgo(7) });
    const { result } = renderHook(() => useCoach([post]));

    expect(result.current.getTier('post-1')).toBe('urgent');

    act(() => {
      result.current.snooze('post-1', 1);
    });

    expect(result.current.getTier('post-1')).toBeNull();
  });

  it('card reappears as stale after snooze duration passes', () => {
    const post = makePost({ updatedAt: daysAgo(7) });
    const { result } = renderHook(() => useCoach([post]));

    act(() => {
      result.current.snooze('post-1', 1);
    });
    expect(result.current.getTier('post-1')).toBeNull();

    // Advance clock past the 1-day snooze expiry
    vi.setSystemTime(new Date(NOW.getTime() + 2 * 86400000));

    // getTier re-evaluates isSnoozed with the new clock — snooze is expired
    expect(result.current.getTier('post-1')).toBe('urgent');
  });
});

// ─── topNudges ───────────────────────────────────────────────────────────────

describe('topNudges', () => {
  it('primary sort by tier priority (finalized-stuck > urgent > mild)', () => {
    const posts = [
      makePost({ id: 'mild-post', body: 'x', updatedAt: daysAgo(4) }),
      makePost({ id: 'urgent-post', body: 'x', updatedAt: daysAgo(7) }),
      makePost({ id: 'stuck-post', column: 'finalized', updatedAt: daysAgo(5) }),
    ];
    const { result } = renderHook(() => useCoach(posts));
    const tiers = result.current.topNudges.map((n) => n.tier);
    expect(tiers).toEqual(['finalized-stuck', 'urgent', 'mild']);
  });

  it('secondary sort by age (oldest updatedAt first) within the same tier', () => {
    const posts = [
      makePost({ id: 'newer-post', updatedAt: daysAgo(7) }),
      makePost({ id: 'older-post', updatedAt: daysAgo(10) }),
    ];
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.topNudges[0].post.id).toBe('older-post');
  });

  it('caps at 3 nudges even when more stale cards exist', () => {
    const posts = Array.from({ length: 5 }, (_, i) =>
      makePost({ id: `post-${i}`, updatedAt: daysAgo(7 + i) })
    );
    const { result } = renderHook(() => useCoach(posts));
    expect(result.current.topNudges).toHaveLength(3);
  });
});

// ─── clearSnooze ─────────────────────────────────────────────────────────────

describe('clearSnooze', () => {
  it('removes the snooze key from localStorage and restores the tier', () => {
    const post = makePost({ updatedAt: daysAgo(7) });
    const { result } = renderHook(() => useCoach([post]));

    act(() => { result.current.snooze('post-1', 3); });
    expect(result.current.getTier('post-1')).toBeNull();

    act(() => { result.current.clearSnooze('post-1'); });
    expect(localStorage.getItem('coach_snooze_post-1')).toBeNull();
    expect(result.current.getTier('post-1')).toBe('urgent');
  });
});

// ─── mount cleanup ───────────────────────────────────────────────────────────

describe('mount cleanup', () => {
  it('removes expired coach_snooze_${id} entries from localStorage on mount', () => {
    // Expired snooze — should be removed
    const expired = new Date(NOW.getTime() - 86400000).toISOString();
    localStorage.setItem('coach_snooze_old-post', expired);

    // Active snooze — should survive
    const active = new Date(NOW.getTime() + 86400000).toISOString();
    localStorage.setItem('coach_snooze_active-post', active);

    renderHook(() => useCoach([]));

    expect(localStorage.getItem('coach_snooze_old-post')).toBeNull();
    expect(localStorage.getItem('coach_snooze_active-post')).not.toBeNull();
  });
});
