import JSZip from 'jszip';

/**
 * Counts words in a text string
 * @param {string} text - The text to count words in
 * @returns {number} Word count
 */
function countWords(text) {
  if (!text || typeof text !== 'string') return 0;

  // Split by whitespace and filter out empty strings
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Converts a string to kebab-case slug
 * @param {string} text - The text to slugify
 * @returns {string} Kebab-case slug
 */
function slugify(text) {
  // Guard against falsy input
  if (!text) return 'untitled';

  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

  // Return fallback if slug is empty (e.g., input was only special characters)
  return slug || 'untitled';
}

/**
 * Generates a unique filename from a title, handling collisions with incrementing counter
 * @param {string} title - The title to convert to filename
 * @param {Set<string>} usedFilenames - Set of already used filenames to avoid collisions
 * @returns {string} Unique filename with .md extension
 */
function generateFilename(title, usedFilenames) {
  const baseFilename = slugify(title);
  let filename = `${baseFilename}.md`;

  // Handle collision by appending incrementing counter
  let counter = 1;
  while (usedFilenames.has(filename)) {
    filename = `${baseFilename}-${counter}.md`;
    counter++;
  }

  return filename;
}

/**
 * Generates markdown content with YAML frontmatter for a post
 * @param {Object} post - The post object
 * @param {string} boardName - The name of the board
 * @returns {string} Markdown content with frontmatter
 */
export function generateMarkdown(post, boardName) {
  const { title, body, column, createdAt, updatedAt } = post;

  // Guard against null/undefined title
  const safeTitle = title || '';

  // Count words in title and body
  const titleWords = countWords(safeTitle);
  const bodyWords = countWords(body);
  const totalWords = titleWords + bodyWords;

  // Format dates as ISO 8601
  const createdAtISO = createdAt instanceof Date ? createdAt.toISOString() : createdAt;
  const updatedAtISO = updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt;

  // Escape title for YAML: escape backslashes, quotes, and newlines
  const escapedTitle = safeTitle
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');

  // Build YAML frontmatter with quoted title to handle colons and other special characters
  const frontmatter = `---
title: "${escapedTitle}"
status: ${column}
board: ${boardName}
date: ${createdAtISO}
updated: ${updatedAtISO}
words: ${totalWords}
---`;

  // Trim body to remove whitespace-only content
  const trimmedBody = body ? body.trim() : '';

  // Combine frontmatter with body
  return `${frontmatter}\n\n${trimmedBody}`;
}

/**
 * Downloads a single post as a markdown file
 * @param {Object} post - The post object
 * @param {string} boardName - The name of the board
 * @param {Set<string>} [usedFilenames] - Set of already used filenames to avoid collisions
 * @returns {string} The filename used for download
 */
export function downloadMarkdown(post, boardName, usedFilenames = new Set()) {
  const markdown = generateMarkdown(post, boardName);

  // Generate unique filename
  const filename = generateFilename(post.title, usedFilenames);

  // Add to used filenames set
  usedFilenames.add(filename);

  // Create blob and download
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Clean up
  URL.revokeObjectURL(url);

  return filename;
}

/**
 * Downloads multiple posts as a ZIP file
 * @param {Array<Object>} posts - Array of post objects
 * @param {string} boardName - The name of the board
 * @returns {Promise<void>}
 */
export async function downloadBulkMarkdown(posts, boardName) {
  const zip = new JSZip();
  const usedFilenames = new Set();

  // Add each post to the ZIP
  for (const post of posts) {
    const markdown = generateMarkdown(post, boardName);

    // Generate unique filename using shared helper
    const filename = generateFilename(post.title, usedFilenames);
    usedFilenames.add(filename);

    zip.file(filename, markdown);
  }

  // Generate ZIP file
  const blob = await zip.generateAsync({ type: 'blob' });

  // Create download filename: {board-slug}-published-YYYY-MM-DD.zip
  const boardSlug = slugify(boardName);
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const zipFilename = `${boardSlug}-published-${today}.zip`;

  // Trigger download
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = zipFilename;
  anchor.click();

  // Clean up
  URL.revokeObjectURL(url);
}
