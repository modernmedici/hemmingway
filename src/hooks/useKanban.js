import { useState, useEffect, useRef, useCallback } from 'react';

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export function useKanban() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Always-current reference to posts — avoids stale closure in callbacks
  const postsRef = useRef([]);
  useEffect(() => { postsRef.current = posts; }, [posts]);

  // Load all posts from ~/Desktop/Hemingway/ on mount
  useEffect(() => {
    window.api.posts.list()
      .then(p => { setPosts(p); setLoading(false); })
      .catch(e => {
        console.error('[Posts] Failed to load:', e);
        setError(e?.message ?? 'Failed to load posts');
        setLoading(false);
      });
  }, []);

  const createPost = useCallback(async (title, body, column = 'ideas') => {
    const now = new Date().toISOString();
    const newPost = {
      id: generateId(),
      title: title.trim(),
      body: body.trim(),
      column,
      createdAt: now,
      updatedAt: now,
      publishedTo: [],
    };
    await window.api.posts.save(newPost);
    setPosts(prev => [...prev, newPost]);
    return newPost;
  }, []);

  const updatePost = useCallback(async (id, updates) => {
    const now = new Date().toISOString();
    const merged = { ...updates, updatedAt: now };
    const current = postsRef.current.find(p => p.id === id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...merged } : p));
    if (current) await window.api.posts.save({ ...current, ...merged });
  }, []);

  const movePost = useCallback(async (id, column) => {
    const now = new Date().toISOString();
    const current = postsRef.current.find(p => p.id === id);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, column, updatedAt: now } : p));
    if (current) await window.api.posts.save({ ...current, column, updatedAt: now });
  }, []);

  const deletePost = useCallback(async (id) => {
    await window.api.posts.delete(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  return { posts, loading, error, createPost, updatePost, movePost, deletePost };
}
