import { Link, LoaderFunction, useLoaderData } from "remix";
import {
  json
} from "remix";
import {Layout} from "~/comps/layout";
import { openCollection } from "../sonar.server";

export const loader: LoaderFunction = async () => {
  const collection = await openCollection()
  const info = collection.info
  const records = await collection.query('records', {
    type: 'sonar-medialib/MediaAsset'
  })
  console.log({ info, records, schema: collection.schema })
  return json({ records, info })
}

export default function Index() {
  const data = useLoaderData<any>()
  const { info, records } = data as { info: any, records: Array<any> }
  records.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1)
  return (
    <Layout>
      <div data-c-key>
        Collection key: <code>{info.key}</code>
      </div>
      <div>
        {records.map((record: any, i: number) => (
          <div key={i}>
            <Link to={'/media/' + record.id}>
              <h2>{record.value.title || record.id}</h2>
            </Link>
            <video controls src={'/file/' + record.value.file} />
              <p>{record.value.description}</p>
            <p>
            {record.value.duration && (
              <span>Duration: {formatDuration(record.value.duration)}</span>
            )}
              <br />
              <Link to={'/metadata/' + record.id}>
                full metadata
              </Link>
              <br />
              <DateFormatter date={record.timestamp} />
            </p>
            <hr />
          </div>
        ))}
      </div>
    </Layout>
  );
}

function formatDuration(seconds: number): string {
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
