import type { Booking } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  checkOrigin(event)
  return backend<Booking>(event, '/api/bookings', { method: 'POST', body: await readBody(event) })
})
