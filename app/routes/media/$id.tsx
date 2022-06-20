import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {Layout} from "~/comps/layout";
import {MediaAsset} from "~/comps/media-asset";
import { ffprobeFile } from "~/lib/youtube.server";
import { openCollection } from "~/sonar.server";

export let loader: LoaderFunction = async ({ request, params }) => {
  const collection = await openCollection()
  const id = params.id;
  if (!id) throw json({}, { status: 404 })
  const records = await collection.get({ id, type: 'sonar-medialib/MediaAsset' })
  if (!records.length) throw json({ error: 'not found' }, { status: 404 })
  // const fileId = records[0].latest.value.file
  // await ffprobeFile(collection, fileId)
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
