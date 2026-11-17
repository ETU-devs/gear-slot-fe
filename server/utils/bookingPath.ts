import type { H3Event } from 'h3'

export function bookingPath(event: H3Event) {
  const id = getRouterParam(event, 'id')
  if (!id || !/^\d+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { error: 'Некорректный номер бронирования.' } })
  }
  return `/api/bookings/${id}`
}
