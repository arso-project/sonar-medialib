import {
  LoaderFunction, json,
  useLoaderData
} from "remix";
import {Layout} from "~/comps/layout";
import {MediaAsset} from "~/comps/media-asset";
import { openCollection } from "../../sonar.server";

export let loader: LoaderFunction = async ({ request, params }) => {
  const collection = await openCollection()
  const id = params.id;
  if (!id) throw json({}, { status: 404 })
  const records = await collection.get({ id, type: 'sonar-medialib/MediaAsset' })
  if (!records.length) throw json({ error: 'not found' }, { statusCode: 404 })
  return json({ record: records[0] })
};

export default function MediaPage () {
  const loaderData = useLoaderData()
  const { record } = loaderData
  return (
    <Layout>
      <MediaAsset record={record} />
    </Layout>
  )
}
