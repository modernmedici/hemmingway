import { useState, useEffect, useCallback } from 'react';

export function useLinkedIn() {
  const [profile,      setProfile]      = useState(null);
  const [publishing,   setPublishing]   = useState(false);
  const [publishError, setPublishError] = useState(null);

  // Restore connection state on mount (token lives in electron-store, not renderer)
  useEffect(() => {
    window.api.linkedin.getProfile()
      .then(p => { if (p) setProfile(p); })
      .catch(e => console.error('[LinkedIn] Could not restore profile:', e));
  }, []);

  const connect = useCallback(async () => {
    try {
      const p = await window.api.linkedin.connect();
      setProfile(p);
      setPublishError(null);
    } catch (e) {
      console.error('[LinkedIn] connect failed:', e);
      setPublishError(e.message);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await window.api.linkedin.disconnect();
    setProfile(null);
    setPublishError(null);
  }, []);

  const publishPost = useCallback(async (title, body) => {
    if (!profile) throw new Error('Not connected to LinkedIn');
    setPublishing(true);
    setPublishError(null);
    try {
      return await window.api.linkedin.request('POST', 'ugcPosts', {
        author: profile.urn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary:    { text: `${title}\n\n${body}`.trim() },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      });
    } catch (e) {
      setPublishError(e.message);
      throw e;
    } finally {
      setPublishing(false);
    }
  }, [profile]);

  return {
    profile,
    isConnected: !!profile,
    publishing,
    publishError,
    connect,
    disconnect,
    publishPost,
  };
}
