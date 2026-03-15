import { useState, useEffect, useCallback } from 'react';

const LS_TOKEN   = 'hemingway-linkedin-token';
const LS_PROFILE = 'hemingway-linkedin-profile';

function generateVerifier() {
  const arr = new Uint8Array(64);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

async function generateChallenge(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function useLinkedIn() {
  const [token,   setToken]   = useState(() => localStorage.getItem(LS_TOKEN));
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_PROFILE) ?? 'null'); }
    catch { return null; }
  });
  const [publishing,    setPublishing]    = useState(false);
  const [publishError,  setPublishError]  = useState(null);

  useEffect(() => {
    token ? localStorage.setItem(LS_TOKEN, token) : localStorage.removeItem(LS_TOKEN);
  }, [token]);

  useEffect(() => {
    profile
      ? localStorage.setItem(LS_PROFILE, JSON.stringify(profile))
      : localStorage.removeItem(LS_PROFILE);
  }, [profile]);

  const fetchProfile = useCallback(async (accessToken) => {
    const res = await fetch('/api/linkedin/me?projection=(id,localizedFirstName,localizedLastName)', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
    const data = await res.json();
    const p = {
      id:   data.id,
      urn:  `urn:li:person:${data.id}`,
      name: `${data.localizedFirstName ?? ''} ${data.localizedLastName ?? ''}`.trim(),
    };
    setProfile(p);
    return p;
  }, []);

  const connect = useCallback(async () => {
    const verifier   = generateVerifier();
    const challenge  = await generateChallenge(verifier);
    // Encode verifier in state param — Vite middleware reads it back server-side
    const state = btoa(JSON.stringify({ verifier, nonce: Math.random().toString(36).slice(2) }));

    const params = new URLSearchParams({
      response_type:         'code',
      client_id:             import.meta.env.VITE_LINKEDIN_CLIENT_ID,
      redirect_uri:          'http://localhost:5173/auth/linkedin/callback',
      scope:                 'openid profile w_member_social',
      code_challenge:        challenge,
      code_challenge_method: 'S256',
      state,
    });
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
  }, []);

  const disconnect = useCallback(() => {
    setToken(null);
    setProfile(null);
    setPublishError(null);
  }, []);

  const receiveToken = useCallback(async (accessToken) => {
    setToken(accessToken);
    try { await fetchProfile(accessToken); }
    catch (e) { console.error('[LinkedIn] Profile fetch failed:', e); }
  }, [fetchProfile]);

  const publishPost = useCallback(async (title, body) => {
    if (!token || !profile) throw new Error('Not connected to LinkedIn');
    setPublishing(true);
    setPublishError(null);
    try {
      const res = await fetch('/api/linkedin/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          author: profile.urn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary:    { text: `${title}\n\n${body}`.trim() },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`LinkedIn API ${res.status}: ${msg}`);
      }
      return await res.json();
    } catch (e) {
      setPublishError(e.message);
      throw e;
    } finally {
      setPublishing(false);
    }
  }, [token, profile]);

  return {
    token, profile,
    isConnected: !!token && !!profile,
    publishing, publishError,
    connect, disconnect, receiveToken, publishPost,
  };
}
