// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  posts: {
    allow: {
      view: "isOwner",
      create: "isSignedIn",
      update: "isOwner",
      delete: "isOwner",
    },
    bind: {
      isSignedIn: "auth.id != null",
      isOwner: "auth.id in data.ref('creator.id')",
    },
  },
  $users: {
    allow: {
      view: "isSelf",
      update: "isSelf",
    },
    bind: {
      isSelf: "auth.id == data.id",
    },
  },
} satisfies InstantRules;

export default rules;
