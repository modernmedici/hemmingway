// Hemingway InstantDB Schema
// Defines entities, relationships, and permissions
// Docs: https://instantdb.com/docs/schema

import { i } from "@instantdb/core";

const graph = i.graph(
  {
    $users: i.entity({
      email: i.string().unique(),
    }),
    posts: i.entity({
      title: i.string(),
      body: i.string().optional(),
      column: i.string(), // 'ideas' | 'drafts' | 'finalized'
      createdAt: i.date(),
      updatedAt: i.date(),
    }),
  },
  {
    postCreator: {
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
  }
);

// Permissions: users can only read/write their own posts
const permissions = {
  posts: {
    allow: {
      view: "auth.id == data.creator",
      create: "true",
      update: "auth.id == data.creator",
      delete: "auth.id == data.creator",
    },
  },
};

export default { graph, permissions };
