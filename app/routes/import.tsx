import type { ActionFunction, LoaderFunction, Session } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useActionData, useCatch, useFetcher, useLoaderData } from '@remix-run/react'
import { Layout } from '~/comps/layout'
import { importVideoFromUrl } from '~/lib/files.server'
import { openCollection } from '~/lib/sonar.server'
import { getSessionFromRequest, commitSession, withSession } from '~/sessions'
import { useEffect } from 'react'
import { ProgressBar } from '~/comps/progress-bar'
import { Link } from 'react-router-dom'

type ProgressCallback = (arg0: { progress: number }) => void;

type ActionData = {
  running: boolean;
  error?: string
}

type LoaderData = {
  progress: Progress
}

type Progress= {
  state?: 'running' | 'finished'
  progress?: number,
  created?: any;
  error?: string | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSessionFromRequest(request)
  const progress = getProgress(session)
  return withSession(session, json({
    progress
  }))
}

function setProgress (session: Session, input: Progress) {
  const lastInput = (session.get('progress') || {}) as Progress
  const nextInput = { ...lastInput, ...input }
  session.set('progress', nextInput)
  return session
}
function getProgress (session: Session): Progress {
  return session.get('progress') || {}
}

export const action: ActionFunction = async ({ request }): Promise<Response> => {
  const session = await getSessionFromRequest(request)
  try {
    const form = await request.formData()
    const url = form.get('url') as string
    const collection = await openCollection()

    if (!url) {
      throw json({ error: 'URL is required', field: 'url' }, { status: 400 })
    }

    const onProgress: ProgressCallback = async ({ progress }) => {
      const lastProgress = getProgress(session)
      if (lastProgress.state === 'finished') return
      try {
        await commitSession(setProgress(session, { progress }))
      } catch (err) {}
    }

    (async () => {
      try {
        const { mediaAsset } = await importVideoFromUrl(collection, url, { onProgress })
        await commitSession(setProgress(session, {
          created: mediaAsset,
          progress: 1,
          state: 'finished'
        }))
      } catch (err) {
        await commitSession(setProgress(session, { state: 'finished', error: (err as Error).message }))
      }
    })()

    setProgress(session, { progress: 0, error: null, state: 'running' })
    return await withSession(session, json({ running: true }))
  } catch (err) {
    throw err
  }
}

export default function ImportPage () {
  const actionData = useActionData<ActionData | undefined>()
  const loaderData = useLoaderData<LoaderData | undefined>()
  const fetcher = useFetcher()

  const progressData = { ...(loaderData?.progress || {}), ...(fetcher.data?.progress || {}) }

  useEffect(() => {
    if (progressData.state !== 'running' && !actionData?.running) return
    const interval = setInterval(() => {
      if (fetcher.state !== 'idle') return
      if (progressData.state === 'finished') return
      fetcher.load('/import')
    }, 500)
    return () => clearInterval(interval)
  }, [actionData?.running, fetcher, progressData.state])

  console.log({ progressData })
  return (
    <Layout>
      <h1>Import media</h1>
      {actionData?.running && (
        <div data-c-message>Your import is being processed!</div>
      )}
      {progressData.state === 'running' && (
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
        <h2>Import from YouTube</h2>
        <fieldset disabled={progressData.state === 'running'}>
          <label>
            <input placeholder='Paste YouTube URL' type="text" name="url" />
          </label>
          <button type="submit" className="button">
            Import
          </button>
        </fieldset>
      </form>
      <form method="post" action="/upload" encType='multipart/form-data'>
        <h2>Upload file</h2>
        <fieldset disabled={progressData.state === 'running'}>
          <label>
            <input placeholder='Select file' type="file" name="file" />
          </label>
          <button type="submit" className="button">
            Upload
          </button>
        </fieldset>
      </form>
    </Layout>
  )
}

export function CatchBoundary () {
  // this returns { status, statusText, data }
  const caught = useCatch()

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
      )
  }

  return (
    <div>
      Something went wrong: {caught.status}{' '}
      {caught.statusText}
    </div>
  )
}
