// app/sessions.js
// import type {Request} from "request";
import type { Session } from '@remix-run/node'
import { createCookie, createMemorySessionStorage } from '@remix-run/node'

// In this example the Cookie is created separately.
const sessionCookie = createCookie('sonar-medialib-session', {
  secrets: [process.env.SONAR_SESSION_SECRET || 'asdfu293esldfjas'],
  sameSite: true
})

const { getSession, commitSession, destroySession } =
  createMemorySessionStorage({
    cookie: sessionCookie
  })

export async function getSessionFromRequest (request: Request) {
  const session = await getSession(
    request.headers.get('Cookie')
  )
  return session
}

export async function withSession (session: Session, response: Response) {
  const cookie = await commitSession(session)
  response.headers.append('Set-Cookie', cookie)
  return response
}

export { getSession, commitSession, destroySession }
