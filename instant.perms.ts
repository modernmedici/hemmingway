// Permissions for InstantDB
// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from '@instantdb/react'

const rules = {
  // Allow anyone to view user profiles (needed for collaborator names/avatars)
  $users: {
    allow: {
      view: 'true',
    },
  },

  // Boards: TEMPORARILY WIDE OPEN - permission refs failing
  // TODO: Fix permission model before production
  boards: {
    allow: {
      view: 'true',
      create: 'true',
      update: 'true',
      delete: 'true',
    },
  },

  // Posts: TEMPORARILY WIDE OPEN - multi-hop refs don't work in InstantDB
  // TODO: Fix before production by either:
  //   1. Denormalizing: store boardOwnerId/boardMemberIds on posts directly
  //   2. Server-side: use InstantDB backend rules or custom auth
  //   3. Simpler model: single-hop checks only (auth.id == creator.id)
  posts: {
    allow: {
      view: 'true',
      create: 'true',
      update: 'true',
      delete: 'true',
    },
  },

  // Invitations: inviter can create/delete, invitee can view/update
  invitations: {
    allow: {
      view: "auth.id in data.ref('inviter.id') || auth.email == data.email",
      create: "auth.id in data.ref('board.owner.id')",
      update: 'auth.email == data.email', // Invitee can accept/decline
      delete: "auth.id in data.ref('inviter.id')",
    },
  },
} satisfies InstantRules

export default rules
