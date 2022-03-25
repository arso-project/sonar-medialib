import { Response, ActionFunction, LoaderFunction, useActionData, useLoaderData, useCatch, useFetcher, Session } from "remix";
import {
  json
} from "remix";
import {Layout} from "~/comps/layout";
import {importVideoFromUrl} from "~/lib/youtube";
import { openCollection } from "../sonar.server";
import { getSessionFromRequest, commitSession, withSession } from '~/sessions'
import {useEffect} from "react";
import {ProgressBar} from "~/comps/progress-bar";
import {Link} from "react-router-dom";

type ProgressCallback = (arg0: { progress: number }) => void;

type ActionData = {
  running: boolean;
  error?: string
}

type LoaderData = {
  progress: Progress
}

type Progress= {
  progress?: number,
  created?: any;
  finished?: boolean;
  running?: boolean;
  error?: string;
}

export const loader: LoaderFunction = async({ request }) => {
  const session = await getSessionFromRequest(request)
  const progress = getProgress(session)
  return withSession(session, json({
    progress
  }))
}

function setProgress(session: Session, input: Progress) {
  const lastInput = (session.get('progress') || {}) as Progress
  const nextInput = { ...lastInput, ...input }
  session.set('progress', nextInput)
  return session
}
function getProgress(session: Session): Progress {
  return session.get('progress') || {}
}


export const action: ActionFunction = async ({ request }): Promise<Response> => {
  const session = await getSessionFromRequest(request)
  try {
    const form = await request.formData();
    const url = form.get("url");
    const collection = await openCollection()

    if (!url) {
      throw json({ error: "URL is required", field: "url" }, { status: 400 })
    }

    const onProgress: ProgressCallback = async ({ progress }) => {
      const lastProgress = getProgress(session)?.progress || 0
      if (progress === 1 || progress - lastProgress > 0.01) {
        try {
          await commitSession(setProgress(session, { progress }))
        } catch (err) {
        }
      }
    }

    (async () => {
      try {
        const { mediaAsset } = await importVideoFromUrl(collection, url, { onProgress })
        await commitSession(setProgress(session, {
          created: mediaAsset,
          progress: 1,
          running: false,
          finished: true
        }))
      } catch (err) {
        await commitSession(setProgress(session, { running: false, error: (err as Error).message }))
      }
    })()

    setProgress(session, { running: true, progress: 0, finished: false })
    return await withSession(session, json({ running: true }))
  } catch (err) {
    throw err
  }
};

export default function ImportPage() {
  const actionData = useActionData<ActionData | undefined>();
  const loaderData = useLoaderData<LoaderData | undefined>();
  const fetcher = useFetcher()

  const progressData = { ...(loaderData?.progress || {}), ...(fetcher.data?.progress || {}) }

  useEffect(() => {
    if (!actionData?.running) return
    if (progressData.finished) return
    let interval = setInterval(() => {
      if (fetcher.state !== 'idle') return
      if (!progressData.running) return
      fetcher.load('/import')
    }, 500)
    return () => clearInterval(interval)
  }, [actionData?.running, fetcher, progressData.running, progressData.finished])

  return (
    <Layout>
      <h1>Import media</h1>
      {actionData?.running && (progressData.running !== undefined && progressData.running) (
        <div data-c-message>Your import is being processed!</div>
      )}
      {progressData.running && (
        <ProgressBar progress={progressData?.progress} />
      )}
      {progressData.created && (
        <div>
          <strong>Success!</strong> Go watch your your new video:
          <h3><Link to={'/media/' + progressData.created.id}>{progressData.created.value.title || progressData.created.id}</Link></h3>
        </div>
      )}
      {progressData.error && (
        <div>
          <strong>Error!</strong> {String(progressData.error)}
        </div>
      )}
      
      <form method="post">
        <fieldset disabled={progressData.running}>
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
        </fieldset>
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

  return (
    <div>
      Something went wrong: {caught.status}{" "}
      {caught.statusText}
    </div>
  );
}
