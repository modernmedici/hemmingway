import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tmpdir } from 'os';
import { mkdtempSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { rmSync } from 'fs';

// Helpers that mirror the IPC handler logic in electron/main/index.js

function listPosts(dir) {
  return readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(filename => {
      const raw = require('fs').readFileSync(join(dir, filename), 'utf8');
      const { data, content } = matter(raw);
      return { ...data, body: content.trim() };
    })
    .filter(p => p.id);
}

function savePost(dir, post) {
  const { body, ...frontmatter } = post;
  const fileContent = matter.stringify(body ?? '', frontmatter);
  require('fs').writeFileSync(join(dir, `${post.id}.md`), fileContent, 'utf8');
}

function deletePost(dir, id) {
  const filepath = join(dir, `${id}.md`);
  if (existsSync(filepath)) require('fs').unlinkSync(filepath);
}

// ─────────────────────────────────────────────────────────────

let tmpDir;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'hemingway-test-'));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('posts:save + posts:list roundtrip', () => {
  it('persists all post fields and reads them back', () => {
    const post = {
      id: 'abc123',
      title: 'My idea',
      body: 'This is the body.',
      column: 'ideas',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      publishedTo: [],
    };

    savePost(tmpDir, post);
    const posts = listPosts(tmpDir);

    expect(posts).toHaveLength(1);
    expect(posts[0].id).toBe('abc123');
    expect(posts[0].title).toBe('My idea');
    expect(posts[0].body).toBe('This is the body.');
    expect(posts[0].column).toBe('ideas');
  });

  it('handles empty body', () => {
    savePost(tmpDir, { id: 'x1', title: 'No body', body: '', column: 'ideas',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', publishedTo: [] });
    const [post] = listPosts(tmpDir);
    expect(post.body).toBe('');
  });

  it('handles undefined body', () => {
    const { body: _b, ...noBody } = { id: 'x2', title: 'No body', column: 'ideas',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', publishedTo: [] };
    savePost(tmpDir, noBody);
    const [post] = listPosts(tmpDir);
    expect(post.body).toBe('');
  });

  it('overwrites the file when saving the same id again', () => {
    const base = { id: 'x3', title: 'Original', body: 'v1', column: 'ideas',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', publishedTo: [] };
    savePost(tmpDir, base);
    savePost(tmpDir, { ...base, title: 'Updated', body: 'v2' });

    const posts = listPosts(tmpDir);
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Updated');
    expect(posts[0].body).toBe('v2');
  });

  it('lists multiple posts', () => {
    for (let i = 0; i < 3; i++) {
      savePost(tmpDir, { id: `post-${i}`, title: `Post ${i}`, body: `body ${i}`,
        column: 'ideas', createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z', publishedTo: [] });
    }
    expect(listPosts(tmpDir)).toHaveLength(3);
  });
});

describe('posts:list', () => {
  it('returns empty array when directory is empty', () => {
    expect(listPosts(tmpDir)).toEqual([]);
  });

  it('skips files without an id field', () => {
    writeFileSync(join(tmpDir, 'malformed.md'), '---\ntitle: no id\n---\nbody');
    expect(listPosts(tmpDir)).toEqual([]);
  });

  it('skips non-.md files', () => {
    writeFileSync(join(tmpDir, 'notes.txt'), 'ignore me');
    expect(listPosts(tmpDir)).toHaveLength(0);
  });
});

describe('posts:delete', () => {
  it('removes the .md file', () => {
    savePost(tmpDir, { id: 'del1', title: 'To delete', body: '', column: 'ideas',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', publishedTo: [] });
    expect(listPosts(tmpDir)).toHaveLength(1);

    deletePost(tmpDir, 'del1');
    expect(listPosts(tmpDir)).toHaveLength(0);
  });

  it('does not throw when deleting a non-existent id', () => {
    expect(() => deletePost(tmpDir, 'ghost')).not.toThrow();
  });
});
