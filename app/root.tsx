import type { MetaFunction, LinksFunction, LoaderFunction } from '@remix-run/node'
import React from 'react'
import { json } from '@remix-run/node'
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch } from '@remix-run/react'
import { Layout } from './comps/layout.js'

// @ts-ignore
import globalStylesUrl from './styles/global.css'
// import globalMediumStylesUrl from "./styles/global-medium.css";
// import globalLargeStylesUrl from "./styles/global-large.css";

export const meta: MetaFunction = () => {
  const description = 'A p2p media librry'
  return {
    title: 'Sonar Medialib',
    viewport: 'width=device-width,initial-scale=1',
    description
  }
}

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: globalStylesUrl }
  ]
}
export const loader: LoaderFunction = async () => {
  return json({})
}

function Document ({
  children,
  title
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        {title ? <title>{title}</title> : null}
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}

export default function App () {
  return (
    <Document title="Sonar Medialib">
      <Outlet />
      <ScrollRestoration />
    </Document>
  )
}

export function CatchBoundary () {
  const caught = useCatch()
  const title = `${caught.status} ${caught.statusText}`
  return (
    <Document title={title}>
      <Outlet />
      <Layout>
        <div className="error-container">
          <h1>
            {caught.status} {caught.statusText}
          </h1>
        </div>
      </Layout>
    </Document>
  )
}

export function ErrorBoundary ({ error }: { error: Error }) {
  console.error(error)
  return (
    <Document title="Uh-oh!">
      <Outlet />
      <Layout>
        <div className="error-container">
          <h1>App Error</h1>
          <pre>{error.message}</pre>
        </div>
      </Layout>
    </Document>
  )
}
