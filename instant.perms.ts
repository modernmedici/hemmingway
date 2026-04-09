export default {
  posts: {
    allow: {
      create: 'auth != null',
      view: 'auth.id in data.ref("creator.id")',
      update: 'auth.id in data.ref("creator.id")',
      delete: 'auth.id in data.ref("creator.id")',
    },
  },
}
