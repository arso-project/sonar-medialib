// @ts-ignore
import { Workspace } from "@arsonar/client";
import { schema } from './schema'

const url = process.env.SONAR_URL || 'http://localhost:9191/api/v1/default'
const token = process.env.SONAR_TOKEN


// Initializing a client
export const workspace = new Workspace({
  url,
  accessCode: token
});

export default workspace;

let collection: any

export const collectionName = process.env.SONAR_COLLECTION || 'default'

async function ensureSchema (collection: any, schema: any) {
  collection.schema.setDefaultNamespace(schema.defaultNamespace)
  console.log(schema)
  for (const [name, type] of Object.entries(schema.types)) {
    if (!collection.schema.hasType(name)) {
      await collection.putType({ name, ...type })
      console.log('created type', name)
    }
  }
}

export async function openCollection(): Promise<Collection> {
  if (!collection) {
    try {
      collection = await workspace.openCollection(collectionName)
    } catch (err: any) {
      collection = await workspace.createCollection(collectionName)
    }
    console.log('opened collection', collection.key.toString('hex'))
    await ensureSchema(collection, schema)
  }
  return collection
}
