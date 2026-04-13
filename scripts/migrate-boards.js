#!/usr/bin/env node
/**
 * Migration script: Create default boards for existing users
 *
 * This script:
 * 1. Queries all users and their posts
 * 2. For each user, creates a default board named "My Writing"
 * 3. Links the board owner to the user
 * 4. Links all existing posts to their creator's default board
 *
 * Run once after pushing schema changes.
 */

import { init, id, tx } from "@instantdb/admin";

// Load app ID from environment
const APP_ID = process.env.VITE_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!APP_ID || !ADMIN_TOKEN) {
  console.error("Error: Missing environment variables");
  console.error("Required: VITE_INSTANT_APP_ID, INSTANT_ADMIN_TOKEN");
  console.error("\nGet your admin token from: https://instantdb.com/dash");
  process.exit(1);
}

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

async function migrateBoards() {
  console.log("Starting board migration...\n");

  // Query all users and their posts
  const data = await db.query({
    $users: {
      posts: {},
    },
  });

  // Admin SDK returns data directly (no wrapper)
  const users = data.$users || [];
  console.log(`Found ${users.length} users\n`);

  let totalBoards = 0;
  let totalPostsLinked = 0;

  for (const user of users) {
    const posts = user.posts || [];

    // Skip users with no posts
    if (posts.length === 0) {
      console.log(`- ${user.email}: No posts, skipping`);
      continue;
    }

    // Create a default board for this user
    const boardId = id();
    const now = Date.now();

    const transactions = [
      // Create board
      tx.boards[boardId].update({
        name: "My Writing",
        createdAt: now,
        updatedAt: now,
      }),
      // Link board to owner
      tx.boards[boardId].link({ owner: user.id }),
    ];

    // Link all posts to this board
    for (const post of posts) {
      transactions.push(tx.posts[post.id].link({ board: boardId }));
      totalPostsLinked++;
    }

    // Execute transaction
    try {
      await db.transact(transactions);
      totalBoards++;
      console.log(`✓ ${user.email}: Created board, linked ${posts.length} posts`);
    } catch (err) {
      console.error(`✗ ${user.email}: Migration failed`, err.message);
    }
  }

  console.log(`\n--- Migration Complete ---`);
  console.log(`Boards created: ${totalBoards}`);
  console.log(`Posts linked: ${totalPostsLinked}`);
}

migrateBoards()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\nMigration failed:", err);
    process.exit(1);
  });
