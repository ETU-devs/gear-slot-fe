import type { Credentials, LoginResponse } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  checkOrigin(event)
  const body = await readBody<Partial<Credentials> | null>(event)
  const session = await backend<LoginResponse>(event, '/api/auth/login', {
    auth: false,
    method: 'POST',
    body: { email: body?.email, password: body?.password }
  })
  storeSession(event, session.access_token, session.expires_at)
  return sendNoContent(event)
})
