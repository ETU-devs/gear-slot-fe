import type { Booking } from '#shared/types/api'

export default defineEventHandler(event => backend<Booking[]>(event, '/api/bookings'))
