import { init } from '@instantdb/react'
import schema from '../../instant.schema.js'

const APP_ID = '420abe92-3e20-4aed-852e-30b9b830b3a9'

const db = init({ appId: APP_ID, schema })

export default db
