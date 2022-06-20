import type { ActionFunction } from '@remix-run/node'
import { openCollection } from "~/sonar.server";
import {
  json,
  LoaderFunction,
  redirect,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  writeAsyncIterableToWritable,
} from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'
import {importVideoFromStream} from "~/lib/youtube.server";
import { PassThrough } from 'stream'

export const action: ActionFunction = async ({ request }) => {
  const collection = await openCollection()
  const uploadHandler = unstable_composeUploadHandlers(
    async ({ name, contentType, data, filename }) => {
      if (name !== 'file') return null
      const uploadStream = new PassThrough()
      const [{ file, mediaAsset }] = await Promise.all([
        importVideoFromStream(collection, uploadStream, filename, contentType),
        writeAsyncIterableToWritable(data, uploadStream),
      ])
      return mediaAsset.id
    },
    unstable_createMemoryUploadHandler()
  )
  const formData = await unstable_parseMultipartFormData(request, uploadHandler)
  const mediaAssetId = formData.get('file') as string
  return redirect(`/media/${mediaAssetId}`)
}
