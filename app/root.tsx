import type { MetaFunction, LinksFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch } from '@remix-run/react'

// @ts-ignore
import globalStylesUrl from './styles/global.css'
// import globalMediumStylesUrl from "./styles/global-medium.css";
// import globalLargeStylesUrl from "./styles/global-large.css";

export const meta: MetaFunction = () => {
  const description = 'A p2p wiki'
  return {
    title: 'ArsoWiki',
    viewport: 'width=device-width,initial-scale=1',
    description,
    keywords: 'Remix,jokes',
    // "twitter:image": "https://remix-jokes.lol/social.png",
    'twitter:card': 'summary_large_image',
    'twitter:creator': '@remix_run',
    'twitter:site': '@remix_run',
    // "twitter:title": "Remix Jokes",
    'twitter:description': description
  }
}

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: globalStylesUrl }
    // {
    //   rel: "stylesheet",
    //   href: globalMediumStylesUrl,
    //   media: "print, (min-width: 640px)",
    // },
    // {
    //   rel: "stylesheet",
    //   href: globalLargeStylesUrl,
    //   media: "screen and (min-width: 1024px)",
    // },
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
      <div className="error-container">
        <h1>
          {caught.status} {caught.statusText}
        </h1>
      </div>
    </Document>
  )
}

export function ErrorBoundary ({ error }: { error: Error }) {
  console.error(error)

  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  )
}
