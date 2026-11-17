import type { Credentials, User } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  checkOrigin(event)
  const body = await readBody<Partial<Credentials> | null>(event)
  return backend<User>(event, '/api/auth/register', {
    auth: false,
    method: 'POST',
    body: { email: body?.email, password: body?.password }
  })
})
