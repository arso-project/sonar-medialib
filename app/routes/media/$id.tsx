import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Layout } from '~/comps/layout'
import { MediaAsset } from '~/comps/media-asset'
import { openCollection } from '~/lib/sonar.server'

export const loader: LoaderFunction = async ({ params }) => {
  const collection = await openCollection()
  const id = params.id
  if (!id) throw json({}, { status: 404 })
  const records = await collection.get({ id, type: 'sonar-medialib/MediaAsset' })
  if (!records.length) throw json({ error: 'not found' }, { status: 404 })
  return json({ record: records[0] })
}

export default function MediaPage () {
  const loaderData = useLoaderData()
  const { record } = loaderData
  return (
    <Layout>
      <MediaAsset record={record} />
    </Layout>
  )
}
