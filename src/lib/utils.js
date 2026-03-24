export function idleDays(updatedAt) {
  return Math.floor((Date.now() - new Date(updatedAt)) / 86400000);
}

export function nudgeReason(tier, post) {
  if (tier === 'finalized-stuck') return 'Ready to publish';
  const days = idleDays(post.updatedAt);
  return `${days} day${days !== 1 ? 's' : ''} idle`;
}
