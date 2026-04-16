#!/usr/bin/env node
/**
 * Create a board for a specific user
 *
 * Usage: node scripts/create-board-for-user.js <email> [board-name]
 * Example: node scripts/create-board-for-user.js shravnages@gmail.com "My Writing"
 */

import { init, id, tx } from "@instantdb/admin";

const APP_ID = process.env.VITE_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!APP_ID || !ADMIN_TOKEN) {
  console.error("Error: Missing environment variables");
  console.error("Required: VITE_INSTANT_APP_ID, INSTANT_ADMIN_TOKEN");
  console.error("\nGet your admin token from: https://instantdb.com/dash");
  process.exit(1);
}

const userEmail = process.argv[2];
const boardName = process.argv[3] || "My Writing";

if (!userEmail) {
  console.error("Error: User email required");
  console.error("Usage: node scripts/create-board-for-user.js <email> [board-name]");
  console.error("Example: node scripts/create-board-for-user.js user@example.com");
  process.exit(1);
}

const db = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

async function createBoardForUser() {
  console.log(`Creating board "${boardName}" for ${userEmail}...\n`);

  // Query for the user
  const data = await db.query({
    $users: {
      $: { where: { email: userEmail } },
    },
  });

  const users = data.$users || [];

  if (users.length === 0) {
    console.error(`Error: User ${userEmail} not found`);
    process.exit(1);
  }

  const user = users[0];
  console.log(`Found user: ${user.email} (ID: ${user.id})`);

  // Create board
  const boardId = id();
  const now = Date.now();

  try {
    await db.transact([
      tx.boards[boardId].update({
        name: boardName,
        createdAt: now,
        updatedAt: now,
      }),
      tx.boards[boardId].link({ owner: user.id }),
    ]);

    console.log(`✓ Board created successfully!`);
    console.log(`  Board ID: ${boardId}`);
    console.log(`  Board name: ${boardName}`);
  } catch (err) {
    console.error(`✗ Failed to create board:`, err.message);
    process.exit(1);
  }
}

createBoardForUser()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\nScript failed:", err);
    process.exit(1);
  });
