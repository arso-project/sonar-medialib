import { Response, ActionFunction, LoaderFunction, useActionData, useLoaderData, useCatch } from "remix";
import {
  json
} from "remix";
import {Layout} from "~/comps/layout";
import {importVideoFromUrl} from "~/lib/youtube";
import { openCollection } from "../sonar.server";

type ActionData = {
  success: Boolean
}

export const action: ActionFunction = async ({ request }): Promise<Response> => {
  const form = await request.formData();
  const url = form.get("url");
  const mentions: any = []
  const collection = await openCollection()
  console.log('url', url)
  // if (!url || !url.toString().startsWith('https://youtube.com/')) {
  if (!url) {
    throw json({ error: "URL is required", field: "url" }, { status: 400 })
  }

  const onProgress = ({ progress }) => {
    console.log('PROGRESS:', progress)
  }
  await importVideoFromUrl(collection, url, onProgress)
  // const record = await collection.put({
  //   type: 'doc',
  //   value: {
  //     title,
  //     url,
  //     content,
  //     mentions
  //   }
  // })
  // console.log('created record', record)
  return json({ success: true });
};

export default function ImportPage() {
  const actionData = useActionData<ActionData | undefined>();
  return (
    <Layout>
      <h1>Import media</h1>
      {actionData && actionData.success && (
        <div data-c-message>Success!</div>
      )}
      <form method="post">
        <div>
          <label>
            Url: <input type="text" name="url" />
          </label>
        </div>
        <div>
          <button type="submit" className="button">
            Submit
          </button>
        </div>
      </form>
    </Layout>
  );
}

export function CatchBoundary() {
  // this returns { status, statusText, data }
  const caught = useCatch();

  switch (caught.status) {
    case 400:
      return (
        <div>
          <h2>Invalid input</h2>
          <p>
            <strong>{caught.data.error}</strong>
          </p>
          <ImportPage />
        </div>
      );
    case 404:
      return <div>Invoice not found!</div>;
  }

  // You could also `throw new Error("Unknown status in catch boundary")`.
  // This will be caught by the closest `ErrorBoundary`.
  return (
    <div>
      Something went wrong: {caught.status}{" "}
      {caught.statusText}
    </div>
  );
}
