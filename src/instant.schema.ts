// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $streams: i.entity({
      abortReason: i.string().optional(),
      clientId: i.string().unique().indexed(),
      done: i.boolean().optional(),
      size: i.number().optional(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    posts: i.entity({
      body: i.string().optional(),
      column: i.string(),
      createdAt: i.date(),
      title: i.string(),
      updatedAt: i.date(),
      order: i.number(),
    }),
    boards: i.entity({
      name: i.string(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),
    invitations: i.entity({
      email: i.string().indexed(),
      role: i.string(),
      status: i.string(),
      createdAt: i.date(),
      boardId: i.string().optional(),
      boardName: i.string().optional(),
      inviterName: i.string().optional(),
    }),
  },
  links: {
    $streams$files: {
      forward: {
        on: "$streams",
        has: "many",
        label: "$files",
      },
      reverse: {
        on: "$files",
        has: "one",
        label: "$stream",
        onDelete: "cascade",
      },
    },
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    postsCreator: {
      forward: {
        on: "posts",
        has: "one",
        label: "creator",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "posts",
      },
    },
    boardsOwner: {
      forward: {
        on: "boards",
        has: "one",
        label: "owner",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "ownedBoards",
      },
    },
    boardsMembers: {
      forward: {
        on: "boards",
        has: "many",
        label: "members",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "memberBoards",
      },
    },
    postBoard: {
      forward: {
        on: "posts",
        has: "one",
        label: "board",
      },
      reverse: {
        on: "boards",
        has: "many",
        label: "posts",
      },
    },
    invitationBoard: {
      forward: {
        on: "invitations",
        has: "one",
        label: "board",
      },
      reverse: {
        on: "boards",
        has: "many",
        label: "invitations",
      },
    },
    invitationInviter: {
      forward: {
        on: "invitations",
        has: "one",
        label: "inviter",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "sentInvitations",
      },
    },
  },
  rooms: {
    board: {
      presence: i.entity({
        name: i.string().optional(),
        email: i.string().optional(),
        color: i.string().optional(),
      }),
    },
    postEditor: {
      presence: i.entity({
        name: i.string().optional(),
        email: i.string().optional(),
        color: i.string().optional(),
        cursorPosition: i.number().optional(),
        field: i.string().optional(),
      }),
    },
  },
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
