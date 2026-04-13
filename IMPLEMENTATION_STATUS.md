# Collaborative Writing Implementation Status

## Completed (Phase 1 - Data Layer)

### ✅ Schema Changes (`src/instant.schema.ts`)
- Added `boards` entity with name, timestamps
- Added `invitations` entity with email, role, status, timestamps  
- Added 5 new links: boardsOwner, boardsMembers, postBoard, invitationBoard, invitationInviter
- Added rooms: `board` (for board presence) and `postEditor` (for editing presence)

### ✅ Permission Changes (`src/instant.perms.ts`)
- Boards: view = owner OR member, create = signed in, update/delete = owner only
- Posts: view/update/delete = creator OR board member (via `data.ref('board.owner.id')` etc.)
- Invitations: view = inviter or invitee, create = board owner, update = invitee
- $users: view = true (needed for collaboration UI)

### ✅ Data Layer Hooks
- **`src/hooks/useBoards.js`** - Full CRUD for boards and invitations
  - `boards`, `ownedBoards`, `memberBoards`, `pendingInvitations`
  - `createBoard()`, `updateBoard()`, `deleteBoard()`
  - `inviteToBoard()`, `acceptInvitation()`, `declineInvitation()`
  - `leaveBoard()`, `cancelInvitation()`
  - `isOwner()`, `isMember()`

- **`src/hooks/useKanban.js`** - Updated to board-scoped queries
  - Now accepts `boardId` parameter
  - Queries posts through board: `{ boards: { posts: { creator: {} } } }`
  - Links posts to board on creation

### ✅ App Integration (`src/App.jsx`)
- Integrated useBoards hook
- Auto-selects first board (will be "My Writing" after migration)
- Passes boardId to useKanban

### ✅ Migration Script (`scripts/migrate-boards.js`)
- Creates "My Writing" board for each existing user
- Links all existing posts to their creator's default board
- Ready to run after schema push

### ✅ Documentation
- **COLLABORATION_SETUP.md** - Complete setup guide with troubleshooting
- **instant.config.json** - CLI config pointing to src/ schema files

### ✅ Dependencies
- Upgraded @instantdb/react from 0.14.13 → 1.0.2 (has `i.schema` API)
- @instantdb/admin already present for migration script

---

## Next Steps (Phase 1 - UI)

### 🔲 Schema Push **← START HERE**
```bash
INSTANT_SCHEMA_FILE_PATH=src/instant.schema.ts \
INSTANT_PERMS_FILE_PATH=src/instant.perms.ts \
bun x instant-cli push schema

INSTANT_SCHEMA_FILE_PATH=src/instant.schema.ts \
INSTANT_PERMS_FILE_PATH=src/instant.perms.ts \
bun x instant-cli push perms
```

### 🔲 Data Migration
```bash
export INSTANT_ADMIN_TOKEN="your-token-from-dashboard"
node scripts/migrate-boards.js
```

### 🔲 Verify Single-User Still Works
- Start dev server: `bun run dev`
- Log in and confirm posts are visible
- Create a new post and verify it saves

### 🔲 Board Switcher UI (`src/components/BoardSwitcher.jsx`)
- Dropdown showing all boards (owned + member)
- "Create Board" button
- Active board indicator

### 🔲 Modify AppShell (`src/components/AppShell.jsx`)
- Add BoardSwitcher above nav section
- Add placeholder for CollaboratorAvatars in header

### 🔲 Modify Board Component (`src/components/Board.jsx`)
- Show board name at top
- Add "Share Board" button (if owner)

### 🔲 Share Board Modal (`src/components/ShareBoardModal.jsx`)
- Email input field
- Role selector (editor/viewer)
- Send invitation button

### 🔲 Invitation Banner (`src/components/InvitationBanner.jsx`)
- Shows pending invitations at top of page
- Accept/Decline buttons
- Shows inviter name and board name

### 🔲 Board Presence (`src/components/CollaboratorAvatars.jsx`)
- Colored dots/initials for online users
- Wire up `db.room('board', boardId).usePresence()`
- Deterministic color assignment from user ID

### 🔲 Post Card Attribution (`src/components/PostCard.jsx`)
- Show creator name/initial on shared boards
- Only show on boards with multiple members

---

## Phase 2: Collaborative Editing (Not Started)

### Strategy: Turn-based Edit Locking

No CRDT needed. When a user opens WritingView, they claim an edit lock via presence. Others see real-time updates but can't type until the lock is released.

### To Implement:
- **WritingView** - Join `postEditor` room, publish presence, check for locks
- **EditorPresenceBar** - Show who's in the document, who has edit lock
- **EditLockBanner** - "Alice is editing. You'll see changes in real time."
- **Auto-save** - Debounced 3-second auto-save while editing (for live viewers)

---

## Known Issues / Risks

### ⚠️ Multi-hop Permission Refs
The permission `data.ref('board.owner.id')` traverses two links. Test this works in InstantDB v1.0.2. If it fails, fallback is to add a flat `boardOwnerId` field on posts.

### ⚠️ Posts Without Boards
If migration script doesn't run or fails, posts without a `board` link won't be visible. The migration script is idempotent (safe to re-run).

### ⚠️ $users View Permission
Changed from `isSelf` to `true` so collaborators can see each other's names. This exposes email addresses, which is acceptable for an invite-only tool. If privacy is a concern, create a separate `profiles` entity with only display names.

---

## Testing Checklist

After schema push + migration:

- [ ] Single-user experience unchanged (can see/create/edit posts)
- [ ] Can create a new board
- [ ] Can invite collaborator via email
- [ ] Invitee sees invitation banner
- [ ] Invitee can accept invitation
- [ ] Both users see same posts on shared board
- [ ] Post cards show creator attribution on shared boards
- [ ] Board presence shows online collaborators
- [ ] Permission denied when trying to access private board

---

## Files Changed

**Modified (7):**
- `bun.lock` - Dependency updates
- `package.json` - @instantdb/react → 1.0.2
- `src/hooks/useKanban.js` - Board-scoped queries
- `src/instant.perms.ts` - Multi-user permissions
- `src/instant.schema.ts` - Boards, invitations, rooms
- `src/App.jsx` - Board selection logic

**Created (5):**
- `instant.config.json` - CLI config
- `scripts/migrate-boards.js` - Data migration script
- `src/hooks/useBoards.js` - Board CRUD hook
- `COLLABORATION_SETUP.md` - Setup guide
- `IMPLEMENTATION_STATUS.md` - This file

**Deleted (1):**
- `instant.schema.ts` (root) - Old deprecated schema file removed
