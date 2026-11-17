import type { Equipment } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  checkOrigin(event)
  return backend<Equipment>(event, '/api/equipment', { method: 'POST', body: await readBody(event) })
})
