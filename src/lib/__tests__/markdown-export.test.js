import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateMarkdown, downloadMarkdown, downloadBulkMarkdown } from '../markdown-export';

describe('generateMarkdown', () => {
  const post = {
    id: 'post-123',
    title: 'My Test Post',
    body: 'This is the body text.\n\nWith multiple paragraphs.',
    column: 'finalized',
    createdAt: new Date('2026-01-15T10:30:00.000Z'),
    updatedAt: new Date('2026-01-20T14:45:00.000Z'),
  };

  it('generates markdown with YAML frontmatter', () => {
    const markdown = generateMarkdown(post, 'Published');

    expect(markdown).toContain('---');
    expect(markdown).toContain('title: "My Test Post"');
    expect(markdown).toContain('status: finalized');
    expect(markdown).toContain('board: Published');
    expect(markdown).toContain('date: 2026-01-15T10:30:00.000Z');
    expect(markdown).toContain('updated: 2026-01-20T14:45:00.000Z');
  });

  it('includes word count in frontmatter', () => {
    const markdown = generateMarkdown(post, 'Published');

    // "My Test Post" (3) + "This is the body text. With multiple paragraphs." (8) = 11
    expect(markdown).toContain('words: 11');
  });

  it('includes post body after frontmatter', () => {
    const markdown = generateMarkdown(post, 'Published');

    expect(markdown).toContain('This is the body text.');
    expect(markdown).toContain('With multiple paragraphs.');
  });

  it('formats dates as ISO 8601', () => {
    const markdown = generateMarkdown(post, 'Published');

    expect(markdown).toContain('date: 2026-01-15T10:30:00.000Z');
    expect(markdown).toContain('updated: 2026-01-20T14:45:00.000Z');
  });

  it('handles posts with empty body', () => {
    const emptyPost = { ...post, body: '' };
    const markdown = generateMarkdown(emptyPost, 'Published');

    expect(markdown).toContain('words: 3'); // Only title words
    expect(markdown).toContain('---\n\n'); // Empty body section
  });

  it('handles posts with only whitespace body', () => {
    const whitespacePost = { ...post, body: '   \n\n   ' };
    const markdown = generateMarkdown(whitespacePost, 'Published');

    expect(markdown).toContain('words: 3'); // Only title words
  });

  it('counts words correctly across title and body', () => {
    const testPost = {
      ...post,
      title: 'One Two Three',
      body: 'Four Five',
    };
    const markdown = generateMarkdown(testPost, 'Published');

    expect(markdown).toContain('words: 5');
  });

  it('escapes titles with colons in YAML frontmatter', () => {
    const colonPost = { ...post, title: 'My Post: A Reflection' };
    const markdown = generateMarkdown(colonPost, 'Published');

    expect(markdown).toContain('title: "My Post: A Reflection"');
    expect(markdown).not.toContain('title: My Post: A Reflection'); // Should be quoted
  });

  it('escapes titles with double quotes in YAML frontmatter', () => {
    const quotePost = { ...post, title: 'A "Quoted" Title' };
    const markdown = generateMarkdown(quotePost, 'Published');

    expect(markdown).toContain('title: "A \\"Quoted\\" Title"');
  });

  it('escapes titles with backslashes in YAML frontmatter', () => {
    const backslashPost = { ...post, title: 'Path\\To\\File' };
    const markdown = generateMarkdown(backslashPost, 'Published');

    expect(markdown).toContain('title: "Path\\\\To\\\\File"');
  });

  it('trims whitespace-only body', () => {
    const whitespacePost = { ...post, body: '   \n\n   ' };
    const markdown = generateMarkdown(whitespacePost, 'Published');

    // Should end with frontmatter and empty body section (no extra whitespace)
    expect(markdown).toMatch(/---\n\n$/);
  });
});

describe('downloadMarkdown', () => {
  let createElementSpy;
  let clickSpy;
  let appendChildSpy;
  let removeChildSpy;
  let mockAnchor;
  let originalCreateObjectURL;
  let originalRevokeObjectURL;

  beforeEach(() => {
    // Mock DOM APIs
    clickSpy = vi.fn();
    mockAnchor = {
      click: clickSpy,
      href: '',
      download: '',
    };
    createElementSpy = vi.fn(() => mockAnchor);
    appendChildSpy = vi.fn();
    removeChildSpy = vi.fn();

    // Stub document methods
    globalThis.document = {
      createElement: createElementSpy,
      body: {
        appendChild: appendChildSpy,
        removeChild: removeChildSpy,
      },
    };

    // Mock URL.createObjectURL and revokeObjectURL
    originalCreateObjectURL = globalThis.URL?.createObjectURL;
    originalRevokeObjectURL = globalThis.URL?.revokeObjectURL;
    globalThis.URL = {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    };
  });

  afterEach(() => {
    if (originalCreateObjectURL) {
      globalThis.URL.createObjectURL = originalCreateObjectURL;
    }
    if (originalRevokeObjectURL) {
      globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });

  const post = {
    id: 'post-123',
    title: 'Download Test',
    body: 'Body content',
    column: 'finalized',
    createdAt: new Date('2026-01-15T10:30:00.000Z'),
    updatedAt: new Date('2026-01-15T10:30:00.000Z'),
  };

  it('creates a download link with correct filename', () => {
    downloadMarkdown(post, 'Published');

    const anchor = createElementSpy.mock.results[0].value;
    expect(anchor.download).toBe('download-test.md');
  });

  it('uses kebab-case slug from title', () => {
    const complexPost = { ...post, title: 'My Complex Title!! With Symbols' };
    downloadMarkdown(complexPost, 'Published');

    const anchor = createElementSpy.mock.results[0].value;
    expect(anchor.download).toBe('my-complex-title-with-symbols.md');
  });

  it('appends counter on filename collision', () => {
    const usedFilenames = new Set(['download-test.md']);
    downloadMarkdown(post, 'Published', usedFilenames);

    const anchor = createElementSpy.mock.results[0].value;
    expect(anchor.download).toBe('download-test-1.md');
  });

  it('handles empty title by using "untitled"', () => {
    const emptyTitlePost = { ...post, title: '' };
    downloadMarkdown(emptyTitlePost, 'Published');

    const anchor = createElementSpy.mock.results[0].value;
    expect(anchor.download).toBe('untitled.md');
  });

  it('handles special-character-only title by using "untitled"', () => {
    const specialPost = { ...post, title: '!!!' };
    downloadMarkdown(specialPost, 'Published');

    const anchor = createElementSpy.mock.results[0].value;
    expect(anchor.download).toBe('untitled.md');
  });

  it('adds filename to usedFilenames set', () => {
    const usedFilenames = new Set();
    const filename = downloadMarkdown(post, 'Published', usedFilenames);

    expect(usedFilenames.has(filename)).toBe(true);
    expect(usedFilenames.has('download-test.md')).toBe(true);
  });

  it('triggers download', () => {
    downloadMarkdown(post, 'Published');

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('cleans up blob URL after download', () => {
    downloadMarkdown(post, 'Published');

    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('returns the filename used', () => {
    const filename = downloadMarkdown(post, 'Published');

    expect(filename).toBe('download-test.md');
  });

  it('returns counter-suffixed filename when collision detected', () => {
    const usedFilenames = new Set(['download-test.md']);
    const filename = downloadMarkdown(post, 'Published', usedFilenames);

    expect(filename).toBe('download-test-1.md');
  });
});

describe('downloadBulkMarkdown', () => {
  let createElementSpy;
  let clickSpy;
  let mockAnchor;
  let originalCreateObjectURL;
  let originalRevokeObjectURL;

  beforeEach(() => {
    clickSpy = vi.fn();
    mockAnchor = {
      click: clickSpy,
      href: '',
      download: '',
    };
    createElementSpy = vi.fn(() => mockAnchor);

    // Stub document methods
    globalThis.document = {
      createElement: createElementSpy,
    };

    // Mock URL.createObjectURL and revokeObjectURL
    originalCreateObjectURL = globalThis.URL?.createObjectURL;
    originalRevokeObjectURL = globalThis.URL?.revokeObjectURL;
    globalThis.URL = {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    };
  });

  afterEach(() => {
    if (originalCreateObjectURL) {
      globalThis.URL.createObjectURL = originalCreateObjectURL;
    }
    if (originalRevokeObjectURL) {
      globalThis.URL.revokeObjectURL = originalRevokeObjectURL;
    }
  });

  const posts = [
    {
      id: 'post-1',
      title: 'First Post',
      body: 'First body',
      column: 'finalized',
      createdAt: new Date('2026-01-15T10:00:00.000Z'),
      updatedAt: new Date('2026-01-15T10:00:00.000Z'),
    },
    {
      id: 'post-2',
      title: 'Second Post',
      body: 'Second body',
      column: 'finalized',
      createdAt: new Date('2026-01-15T11:00:00.000Z'),
      updatedAt: new Date('2026-01-15T11:00:00.000Z'),
    },
  ];

  it('creates a ZIP file with correct naming', async () => {
    await downloadBulkMarkdown(posts, 'Published');

    const anchor = createElementSpy.mock.results[0].value;
    expect(anchor.download).toMatch(/^published-published-\d{4}-\d{2}-\d{2}\.zip$/);
  });

  it('uses kebab-case slug from board name', async () => {
    await downloadBulkMarkdown(posts, 'My Draft Board');

    const anchor = createElementSpy.mock.results[0].value;
    expect(anchor.download).toMatch(/^my-draft-board-published-\d{4}-\d{2}-\d{2}\.zip$/);
  });

  it('handles filename collisions within ZIP', async () => {
    const duplicatePosts = [
      { ...posts[0], id: 'post-1' },
      { ...posts[0], id: 'post-2' }, // Same title as post-1
    ];

    await downloadBulkMarkdown(duplicatePosts, 'Published');

    // Should not throw, and should create unique filenames
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('handles 3+ posts with same title using incrementing counter', async () => {
    const triplicatePosts = [
      { ...posts[0], id: 'post-1', title: 'Duplicate Title' },
      { ...posts[0], id: 'post-2', title: 'Duplicate Title' },
      { ...posts[0], id: 'post-3', title: 'Duplicate Title' },
      { ...posts[0], id: 'post-4', title: 'Duplicate Title' },
    ];

    // This should not throw and should generate unique filenames
    // (duplicate-title.md, duplicate-title-1.md, duplicate-title-2.md, duplicate-title-3.md)
    await downloadBulkMarkdown(triplicatePosts, 'Published');

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('triggers download', async () => {
    await downloadBulkMarkdown(posts, 'Published');

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('cleans up blob URL after download', async () => {
    await downloadBulkMarkdown(posts, 'Published');

    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('handles empty array gracefully', async () => {
    await downloadBulkMarkdown([], 'Published');

    // Should still create a ZIP, even if empty
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('handles single post', async () => {
    await downloadBulkMarkdown([posts[0]], 'Published');

    expect(clickSpy).toHaveBeenCalledOnce();
  });
});
