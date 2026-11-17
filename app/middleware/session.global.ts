export default defineNuxtRouteMiddleware(async (to, from) => {
  const nuxtApp = useNuxtApp()
  if (import.meta.client && nuxtApp.isHydrating && nuxtApp.payload.serverRendered) return
  if (import.meta.client && to.path === from.path && to.path === '/equipment') return

  const guestPage = to.path === '/login' || to.path === '/register'
  const privatePage = to.meta.requiresAuth === true
  if (to.path !== '/' && !guestPage && !privatePage) return

  const { refresh } = useSession()
  const user = await refresh().catch(() => undefined)
  if (to.path === '/') return navigateTo(user ? '/equipment' : '/login')
  if (guestPage && user) return navigateTo('/equipment')
  if (privatePage && user === null) return navigateTo('/login')
  if (privatePage && user === undefined) {
    throw createError({ statusCode: 503, statusMessage: 'Service Unavailable', fatal: true })
  }
})
