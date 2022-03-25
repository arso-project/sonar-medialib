import type {
  LoaderFunction
} from "remix";
import { openCollection } from "../../sonar.server";

export let loader: LoaderFunction = async ({ request, params }) => {
  const collection = await openCollection()
  const id = params.id;
  const requestHeaders = Object.fromEntries(request.headers.entries())
  const res = await collection.files.readFile(id, { responseType: 'raw', headers: requestHeaders })
  console.log({
    origReqHeaders: requestHeaders,
    resHeaders: res.headers._headers
  })
  return new Response(res.body, {
    status: res.status,
    // TODO: Change to public entries() API once sonar client moves to WebApi fetch
    headers: res.headers._headers
  });
};