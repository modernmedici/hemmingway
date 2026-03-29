import { useState, useMemo, useCallback } from 'react';

const TIER_ORDER = { 'finalized-stuck': 0, urgent: 1, mild: 2 };

function computeTier(post, snoozeMap) {
  // Snoozed: check expiry
  const snoozeExpiry = snoozeMap[post.id];
  if (snoozeExpiry && new Date(snoozeExpiry).getTime() > Date.now()) return null;

  const updatedMs = new Date(post.updatedAt).getTime();
  if (isNaN(updatedMs)) return null;
  const idleDays = Math.floor((Date.now() - updatedMs) / 86400000);

  // Priority 1: finalized-stuck (takes precedence over mild/urgent)
  if (post.column === 'finalized' && idleDays >= 3) return 'finalized-stuck';
  // Priority 2: urgent
  if (idleDays >= 6) return 'urgent';
  // Priority 3: mild
  if (idleDays >= 3) return 'mild';
  return null;
}

function loadSnoozeFromStorage() {
  const map = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('coach_snooze_')) {
      map[key.slice('coach_snooze_'.length)] = localStorage.getItem(key);
    }
  }
  return map;
}

export function useCoach(posts) {
  const [snoozeMap, setSnoozeMap] = useState(() => loadSnoozeFromStorage());

  const tierMap = useMemo(() => {
    const map = {};
    for (const post of posts) {
      const tier = computeTier(post, snoozeMap);
      if (tier) map[post.id] = tier;
    }
    return map;
  }, [posts, snoozeMap]);

  const staleCards = useMemo(
    () => posts.filter(p => tierMap[p.id]),
    [posts, tierMap]
  );

  const topNudges = useMemo(() => {
    return [...staleCards]
      .sort((a, b) => (TIER_ORDER[tierMap[a.id]] ?? 99) - (TIER_ORDER[tierMap[b.id]] ?? 99))
      .slice(0, 3);
  }, [staleCards, tierMap]);

  const getTier = useCallback(
    (id) => tierMap[id] ?? null,
    [tierMap]
  );

  const snooze = useCallback((id, days) => {
    const expiry = new Date(Date.now() + days * 86400000).toISOString();
    localStorage.setItem(`coach_snooze_${id}`, expiry);
    setSnoozeMap(prev => ({ ...prev, [id]: expiry }));
  }, []);

  return { staleCards, topNudges, getTier, snooze };
}
