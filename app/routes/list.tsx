import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Layout } from '~/comps/layout'
import { openCollection } from '../sonar.server'
import { getSessionFromRequest } from '~/sessions'
import { MediaAsset } from '~/comps/media-asset'

export const loader: LoaderFunction = async ({ request }): Promise<Response> => {
  // const session = await getSessionFromRequest(request)
  try {
    const collection = await openCollection()
    const info = collection.info
    const records = await collection.query('records', {
      type: 'sonar-medialib/MediaAsset'
    })
    // console.log({ info, records, schema: collection.schema })
    return json({ records, info }, {
    })
  } catch (err) {
    return json({
      error: (err as Error).message
    })
    // {
    //   statusCode: 500,
    //   headers: {
    //       "Set-Cookie": await commitSession(session),
    //     },
    // })
  }
}

export default function Index () {
  const data = useLoaderData<any>()
  const { info, records } = data as { info: any, records: Array<any> }
  records.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
  return (
    <Layout>
      <div data-c-key>
        Collection key: <code>{info.key}</code>
      </div>
      <div data-c-list-page>
        {records.map((record: any, i: number) => (
          <div key={i}>
            <MediaAsset record={record} />
          </div>
        ))}
      </div>
    </Layout>
  )
}
