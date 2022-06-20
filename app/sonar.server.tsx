import { Workspace } from '@arsonar/client'
import type { Collection } from '@arsonar/client'
import Dotenv from 'dotenv'
import { schema } from './schema'

Dotenv.config()

const url = process.env.SONAR_URL || 'http://localhost:9191/api/v1/default'
const token = process.env.SONAR_TOKEN

// Initializing a client
export const workspace = new Workspace({
  url,
  accessCode: token
})

export default workspace

let collection: Collection | undefined

export const collectionName = process.env.SONAR_COLLECTION || 'default'

async function ensureSchema (collection: Collection) {
  collection.schema!.setDefaultNamespace(schema.defaultNamespace)
  for (const [name, type] of Object.entries(schema.types)) {
    if (!collection.schema!.hasType(name)) {
      const spec = { name, ...type }
      await collection.putType(spec)
      console.log('created type', name)
    }
  }
}

export async function openCollection (): Promise<Collection> {
  if (!collection) {
    try {
      collection = await workspace.openCollection(collectionName)
    } catch (err: any) {
      collection = await workspace.createCollection(collectionName)
    }
    console.log('opened collection', collection.key)
    await ensureSchema(collection)
  }
  return collection
}
