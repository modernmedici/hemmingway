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

  // Boards: owner creates/deletes, members can view, anyone can bind themselves
  boards: {
    allow: {
      view: "auth.id == data.ref('owner.id') || auth.id in data.ref('members.id')",
      create: 'true', // Any signed-in user can create boards
      update: 'true', // Allow binding members (gated by invitation flow in app logic)
      delete: "auth.id == data.ref('owner.id')",
    },
  },

  // Posts: temporarily wide open for debugging
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
