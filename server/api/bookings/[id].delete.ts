export default defineEventHandler(async (event) => {
  checkOrigin(event)
  await backend(event, bookingPath(event), { method: 'DELETE' })
  return sendNoContent(event)
})
