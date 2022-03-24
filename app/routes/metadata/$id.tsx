import { Form, Link, LoaderFunction, useLoaderData } from "remix";
import {
  json
} from "remix";
import {Layout} from "~/comps/layout";
import { openCollection } from "../../sonar.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const collection = await openCollection()
  const records = await collection.get({
    type: 'sonar-medialib/MediaAsset',
    id: params.id
  })
  const mediaRecord = records[0]
  if (!mediaRecord) throw json("not found", { status: 404 })
  const importedMetadataRecords = await collection.get({
    type: 'sonar-medialib/ImportedMetadata',
    id: mediaRecord.value.importedMetadata
  })
  const importedMetadata = importedMetadataRecords[0]
  return json({ mediaRecord, importedMetadata })
}

export default function Page() {
  const data = useLoaderData<any>()
  console.log(data)
  const records = [data.mediaRecord, data.importedMetadata]
  // const { records } = data as { info: any, records: Array<any> }
  return (
    <Layout>
      <div>
        {records.map((record: any, i: number) => (
          <div key={i}>
            <h2>{record.id}</h2>
            <em>{record.address}</em>
            <pre>
              {JSON.stringify(record.value, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </Layout>
  );
}
