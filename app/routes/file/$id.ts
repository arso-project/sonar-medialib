import type { LoaderFunction } from "@remix-run/node";
import { openCollection } from "../../sonar.server";

export let loader: LoaderFunction = async ({ request, params }) => {
  const collection = await openCollection()
  const id = params.id;
  const requestHeaders = Object.fromEntries(request.headers.entries())
  const res = await collection.files.readFile(id!, { responseType: 'raw', headers: requestHeaders })
  return new Response(res.body, {
    status: res.status,
    // TODO: Change to public entries() API once sonar client moves to WebApi fetch
    // @ts-expect-error
    headers: res.headers._headers
  });
};
