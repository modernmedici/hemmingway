import { init } from '@instantdb/react'
import schema from '../../instant.schema'

// TODO: Replace with your InstantDB app ID from https://instantdb.com/dash
const APP_ID = 'YOUR_APP_ID_HERE'

const db = init({ appId: APP_ID, schema })

export default db
