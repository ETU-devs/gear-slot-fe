import type { User } from '#shared/types/api'

export default defineEventHandler(event => backend<User>(event, '/api/auth/me'))
