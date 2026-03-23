import { useMemo, useEffect } from 'react';

const MILD_DAYS = 3;
const URGENT_DAYS = 6;
const FINALIZED_STUCK_DAYS = 3;
const IDEAS_EMPTY_MILD_DAYS = 2;

function idleDays(updatedAt) {
  return Math.floor((Date.now() - new Date(updatedAt)) / 86400000);
}

function getSnoozedUntil(id) {
  try {
    return localStorage.getItem(`coach_snooze_${id}`);
  } catch {
    return null;
  }
}

function isSnoozed(id) {
  const expiry = getSnoozedUntil(id);
  if (!expiry) return false;
  return new Date(expiry) > new Date();
}

function computeTier(post) {
  const days = idleDays(post.updatedAt);

  if (post.column === 'finalized') {
    return days >= FINALIZED_STUCK_DAYS ? 'finalized-stuck' : null;
  }

  if (days >= URGENT_DAYS) return 'urgent';

  // Ideas with no body get a lower mild threshold
  const mildThreshold =
    post.column === 'ideas' && !post.body ? IDEAS_EMPTY_MILD_DAYS : MILD_DAYS;

  if (days >= mildThreshold) return 'mild';

  return null;
}

const TIER_ORDER = { 'finalized-stuck': 0, urgent: 1, mild: 2 };

export function useCoach(posts) {
  // Clean up expired snoozes on mount
  useEffect(() => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('coach_snooze_')) {
          const expiry = localStorage.getItem(key);
          if (expiry && new Date(expiry) <= new Date()) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const staleKey = posts.map(p => `${p.id}:${p.updatedAt}`).join(',');

  const { staleCards, topNudges } = useMemo(() => {
    const cards = posts
      .filter(p => !isSnoozed(p.id))
      .map(p => ({ post: p, tier: computeTier(p) }))
      .filter(({ tier }) => tier !== null);

    cards.sort((a, b) => {
      const tierDiff = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
      if (tierDiff !== 0) return tierDiff;
      return idleDays(b.post.updatedAt) - idleDays(a.post.updatedAt);
    });

    return {
      staleCards: cards.map(({ post }) => post),
      topNudges: cards.slice(0, 3),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staleKey]);

  const getTier = (id) => {
    if (isSnoozed(id)) return null;
    const post = posts.find(p => p.id === id);
    return post ? computeTier(post) : null;
  };

  const snooze = (id, days) => {
    try {
      const expiry = new Date(Date.now() + days * 86400000).toISOString();
      localStorage.setItem(`coach_snooze_${id}`, expiry);
    } catch {
      // Storage full
    }
  };

  const clearSnooze = (id) => {
    try {
      localStorage.removeItem(`coach_snooze_${id}`);
    } catch {
      // ignore
    }
  };

  return { staleCards, topNudges, getTier, snooze, clearSnooze };
}
