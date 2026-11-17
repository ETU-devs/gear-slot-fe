export default defineEventHandler(async (event) => {
  checkOrigin(event)
  try {
    await backend(event, '/api/auth/logout', { method: 'POST' })
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode !== 401) throw error
  }
  clearGearSession(event)
  return sendNoContent(event)
})
