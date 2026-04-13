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

  // Boards: owner and members can view/update, only owner can delete
  boards: {
    allow: {
      view: 'isBoardOwner || isBoardMember',
      create: 'true', // Any signed-in user can create boards
      update: 'isBoardOwner || isBoardMember',
      delete: 'isBoardOwner',
    },
    bind: {
      isBoardOwner: "auth.id in data.ref('owner.id')",
      isBoardMember: "auth.id in data.ref('members.id')",
    },
  },

  // Posts: creator, board owner, or board members can access
  posts: {
    allow: {
      view: 'isCreator || isBoardOwner || isBoardMember',
      create: 'isBoardOwner || isBoardMember',
      update: 'isCreator || isBoardOwner || isBoardMember',
      delete: 'isCreator || isBoardOwner || isBoardMember',
    },
    bind: {
      isCreator: "auth.id in data.ref('creator.id')",
      isBoardOwner: "auth.id in data.ref('board.owner.id')",
      isBoardMember: "auth.id in data.ref('board.members.id')",
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
