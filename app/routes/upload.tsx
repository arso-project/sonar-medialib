import type { ActionFunction } from '@remix-run/node'
import {
  redirect,
  // eslint-disable-next-line
  unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData,
  writeAsyncIterableToWritable
} from '@remix-run/node'
import { PassThrough } from 'stream'
import { importVideoFromStream } from '~/lib/files.server'
import { openCollection } from '~/lib/sonar.server'

export const action: ActionFunction = async ({ request }) => {
  const collection = await openCollection()
  const uploadHandler = unstable_composeUploadHandlers(
    async ({ name, contentType, data, filename }) => {
      if (name !== 'file') return null
      const uploadStream = new PassThrough()
      const [{ mediaAsset }] = await Promise.all([
        importVideoFromStream(collection, uploadStream, filename, contentType),
        writeAsyncIterableToWritable(data, uploadStream)
      ])
      return mediaAsset.id
    },
    unstable_createMemoryUploadHandler()
  )
  const formData = await unstable_parseMultipartFormData(request, uploadHandler)
  const mediaAssetId = formData.get('file') as string
  return redirect(`/media/${mediaAssetId}`)
}
