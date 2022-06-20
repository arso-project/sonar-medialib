import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { Layout } from '~/comps/layout'
import { openCollection } from '~/lib/sonar.server'
import prettyBytes from 'readable-bytes'

export const loader: LoaderFunction = async (): Promise<Response> => {
  // const session = await getSessionFromRequest(request)
  const collection: any = await openCollection()
  return json({ collection: collection.info })
}

export const action: ActionFunction = async ({ request }): Promise<Response> => {
  const collection = await openCollection()
  const form = await request.formData()
  const key = form.get('key') as string
  if (key) {
    await collection.putFeed(key)
  }
  return json({})
}

export default function FeedsPage () {
  const data = useLoaderData()
  console.log(data)
  const feeds = data.collection.feeds
  return (
        <Layout>
          <h1>Manage collection</h1>
      <div data-c-key>
      Collection primary key:<br /><code>{data.collection.key}</code>
      </div>
        <h3>Feeds</h3>
        <Form method='post'>
            <input name='key' placeholder='Paste key...' />
            <button type='submit'>Add feed</button>
        </Form>
          {feeds.map((feed: any) => (
            <Feed feed={feed} key={feed.key} />
          ))}
        </Layout>
  )
}

function Feed ({ feed }: { feed: any }) {
  return (
        <div data-c-feed>
            <h3>{feed.alias} {feed.key}</h3>
            <div>
                Writable: <strong>{feed.writable ? 'Yes' : 'No'}</strong>
                &nbsp; Type: {feed.type}
            </div>
            <div>Size: <strong>{prettyBytes(feed.byteLength)}</strong> ({feed.length} blocks)</div>
        </div>
  )
}
