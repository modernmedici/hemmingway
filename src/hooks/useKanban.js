import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'hemingway-posts';

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Corrupted JSON — start fresh
  }
  return [];
}

export function useKanban() {
  const [posts, setPosts] = useState(loadFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // Storage full or unavailable
    }
  }, [posts]);

  const createPost = useCallback((title, body, column = 'ideas') => {
    const now = new Date().toISOString();
    const newPost = {
      id: generateId(),
      title: title.trim(),
      body: body.trim(),
      column,
      createdAt: now,
      updatedAt: now,
    };
    setPosts((prev) => [...prev, newPost]);
    return newPost;
  }, []);

  const updatePost = useCallback((id, updates) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, ...updates, updatedAt: new Date().toISOString() }
          : post
      )
    );
  }, []);

  const movePost = useCallback((id, column) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, column, updatedAt: new Date().toISOString() }
          : post
      )
    );
  }, []);

  const deletePost = useCallback((id) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  }, []);

  return { posts, createPost, updatePost, movePost, deletePost };
}
