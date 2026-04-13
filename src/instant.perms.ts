// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  boards: {
    allow: {
      view: "isOwnerOrMember",
      create: "isSignedIn",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: {
      isSignedIn: "auth.id != null",
      isOwner: "auth.id in data.ref('owner.id')",
      isOwnerOrMember: "auth.id in data.ref('owner.id') || auth.id in data.ref('members.id')",
    },
  },
  posts: {
    allow: {
      view: "isCreatorOrBoardMember",
      create: "isSignedIn",
      update: "isCreatorOrBoardMember",
      delete: "isCreatorOrBoardMember",
    },
    bind: {
      isSignedIn: "auth.id != null",
      isCreator: "auth.id in data.ref('creator.id')",
      isBoardMember: "auth.id in data.ref('board.owner.id') || auth.id in data.ref('board.members.id')",
      isCreatorOrBoardMember: "auth.id in data.ref('creator.id') || auth.id in data.ref('board.owner.id') || auth.id in data.ref('board.members.id')",
    },
  },
  invitations: {
    allow: {
      view: "isInviterOrInvitee",
      create: "isBoardOwner",
      update: "isInvitee",
      delete: "isBoardOwner",
    },
    bind: {
      isBoardOwner: "auth.id in data.ref('board.owner.id')",
      isInviterOrInvitee: "auth.id in data.ref('inviter.id') || auth.email == data.email",
      isInvitee: "auth.email == data.email",
    },
  },
  $users: {
    allow: {
      view: "true",
      update: "isSelf",
    },
    bind: {
      isSelf: "auth.id == data.id",
    },
  },
} satisfies InstantRules;

export default rules;
