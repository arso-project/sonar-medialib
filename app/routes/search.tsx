import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { Layout } from '~/comps/layout'
import { openCollection } from '~/lib/sonar.server'

export const loader: LoaderFunction = async ({ request }) => {
  const collection = await openCollection()
  const info = collection.info
  const url = new URL(request.url)
  const query = url.searchParams.get('q')
  if (!query) {
    return ({ records: [], info })
  }
  const searchResults = await collection.query('search', query)
  const records = searchResults.filter(r => r.hasType('MediaAsset'))
  return json({ records, info })
}

export default function Index () {
  const data = useLoaderData<any>()
  const { info, records } = data as { info: any, records: Array<any> }
  console.log(records)
  return (
    <Layout>
      <Form>
        <input name='q' placeholder='Type to search ...' />
        <button>Search</button>
      </Form>
      <div>
        {records.map((record: any, i: number) => (
          <div key={i} data-c-search-item>
            <Link to={'/media/' + record.id}>
              <h2>{record.value.title || record.id}</h2>
            </Link>
            {record.value.duration && (
              <p>Duration: {formatDuration(record.value.duration)}</p>
            )}
            {record.value.file && (
              <video controls src={'/file/' + record.value.file} />
            )}
            <div>
              <DateFormatter date={record.timestamp} />
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}

function formatDuration (seconds: number): string {
  const date = new Date(0)
  date.setSeconds(seconds)
  const timeString = date.toISOString().substr(11, 8)
  return timeString
}

function DateFormatter ({ date }: any) {
  if (!date) return null
  const formatted = new Intl.DateTimeFormat('de-DE', { dateStyle: 'full', timeStyle: 'long' }).format(new Date(date))
  return <em>{formatted}</em>
}
