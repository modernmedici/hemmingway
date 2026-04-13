# Collaboration Feature Setup

This guide covers setting up collaborative writing features in Hemingway.

## Prerequisites

- InstantDB app with admin token (get from https://instantdb.com/dash)
- @instantdb/react upgraded to v1.0.2+ (already done)
- @instantdb/admin v1.0.0+ (already in package.json)

## Step 1: Push Schema Changes

The schema has been updated with `boards` and `invitations` entities. Push it to InstantDB:

```bash
INSTANT_SCHEMA_FILE_PATH=src/instant.schema.ts \
INSTANT_PERMS_FILE_PATH=src/instant.perms.ts \
bun x instant-cli push schema
```

Review the changes in the CLI prompt, then select "Push".

Changes include:
- New `boards` entity with name, timestamps
- New `invitations` entity with email, role, status
- Links: boardsOwner, boardsMembers, postBoard, invitationBoard, invitationInviter
- Rooms: board (presence) and postEditor (presence)

## Step 2: Push Permission Changes

Push the updated permissions:

```bash
INSTANT_SCHEMA_FILE_PATH=src/instant.schema.ts \
INSTANT_PERMS_FILE_PATH=src/instant.perms.ts \
bun x instant-cli push perms
```

New permissions allow:
- Board owners and members to view/edit posts on shared boards
- Invitees to view invitations sent to their email
- All users to see other users' names (needed for collaboration UI)

## Step 3: Run Data Migration

**IMPORTANT: Only run this once after pushing schema changes.**

Get your admin token from InstantDB dashboard, then:

```bash
export INSTANT_ADMIN_TOKEN="your-admin-token-here"
node scripts/migrate-boards.js
```

This creates a "My Writing" board for each existing user and links their posts to it.

## Step 4: Verify Migration

1. Start the dev server: `bun run dev`
2. Log in with an existing account
3. Verify you can still see all your posts
4. Check browser console for any errors

## Step 5: Test Collaboration (After UI Implementation)

Once the UI components are built:

1. Create a new board
2. Invite a collaborator via email
3. Accept invitation from second account
4. Verify both users see the same posts
5. Test real-time presence indicators

## Rollback

If migration fails or you need to rollback:

1. Delete all boards: Use InstantDB dashboard or admin SDK
2. Remove postBoard links from posts
3. Revert schema changes via CLI
4. Re-migrate with fixed script

## Troubleshooting

**"i.schema is not a function"**
- Upgrade @instantdb/react to v1.0.0+: `bun add @instantdb/react@latest`

**"Permission denied" on posts**
- Check permissions were pushed successfully
- Verify multi-hop refs like `data.ref('board.owner.id')` work in your InstantDB version

**Posts not visible after migration**
- Verify every post has a `board` link
- Check board `owner` links point to correct users
- Run migration script again (it's idempotent for posts already linked)

**Admin token not working**
- Get fresh token from https://instantdb.com/dash
- Ensure INSTANT_ADMIN_TOKEN env var is set
- Check APP_ID matches VITE_INSTANT_APP_ID in .env
