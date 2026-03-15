import { useState, useEffect, useCallback } from 'react';

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export function useKanban() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all posts from ~/Desktop/Hemingway/ on mount
  useEffect(() => {
    window.api.posts.list()
      .then(p => { setPosts(p); setLoading(false); })
      .catch(e => { console.error('[Posts] Failed to load:', e); setLoading(false); });
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
    setPosts(prev => {
      const next = prev.map(post =>
        post.id === id
          ? { ...post, ...updates, updatedAt: new Date().toISOString() }
          : post
      );
      const updated = next.find(p => p.id === id);
      if (updated) window.api.posts.save(updated);
      return next;
    });
  }, []);

  const movePost = useCallback(async (id, column) => {
    setPosts(prev => {
      const next = prev.map(post =>
        post.id === id
          ? { ...post, column, updatedAt: new Date().toISOString() }
          : post
      );
      const moved = next.find(p => p.id === id);
      if (moved) window.api.posts.save(moved);
      return next;
    });
  }, []);

  const deletePost = useCallback(async (id) => {
    await window.api.posts.delete(id);
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  return { posts, loading, createPost, updatePost, movePost, deletePost };
}
