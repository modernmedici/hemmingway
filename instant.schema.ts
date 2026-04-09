import { i } from '@instantdb/react'

const schema = i.schema({
  entities: {
    posts: i.entity({
      title: i.string(),
      body: i.string().optional(),
      column: i.string(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),
  },
})

export default schema
