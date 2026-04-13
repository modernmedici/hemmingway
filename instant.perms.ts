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

  // Boards: owner creates/deletes, members can view
  boards: {
    allow: {
      view: "auth.id in [data.ref('owner.id'), data.ref('members.id')]",
      create: 'true', // Any signed-in user can create boards
      update: "auth.id in data.ref('owner.id')",
      delete: "auth.id in data.ref('owner.id')",
    },
  },

  // Posts: creator or board members can view/edit
  posts: {
    allow: {
      view: "auth.id in [data.ref('creator.id'), data.ref('board.owner.id'), data.ref('board.members.id')]",
      create: "auth.id in [data.ref('board.owner.id'), data.ref('board.members.id')]",
      update: "auth.id in [data.ref('creator.id'), data.ref('board.owner.id'), data.ref('board.members.id')]",
      delete: "auth.id in [data.ref('creator.id'), data.ref('board.owner.id'), data.ref('board.members.id')]",
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
