import { init } from '@instantdb/react'

const APP_ID = import.meta.env.VITE_INSTANT_APP_ID || '420abe92-3e20-4aed-852e-30b9b830b3a9'

const db = init({ appId: APP_ID })

export default db
