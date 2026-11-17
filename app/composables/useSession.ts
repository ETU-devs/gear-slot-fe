import type { User } from '#shared/types/api'
import { apiStatus } from '~/utils/apiError'

function useGearRequest() {
  const request = useRequestFetch()
  const cookieHeader = import.meta.server ? useResponseHeader('set-cookie') : undefined

  return { request, forwardSessionCookie }

  function forwardSessionCookie({ response }: { response: Response }) {
    if (!cookieHeader) return
    const cookie = response.headers.get('set-cookie')
    if (cookie) cookieHeader.value = cookie
  }
}

export function useSession() {
  const user = useState<User | null>('session-user', () => null)
  const { request, forwardSessionCookie } = useGearRequest()

  async function refresh() {
    try {
      user.value = await request('/api/auth/me', { onResponse: forwardSessionCookie, retry: 0 })
    } catch (error) {
      if (apiStatus(error) !== 401) throw error
      user.value = null
    }
    return user.value
  }

  return { user, refresh }
}

type GearRequestOptions = {
  method?: 'POST' | 'DELETE'
  body?: Record<string, unknown>
  query?: Record<string, string | undefined>
  signal?: AbortSignal
}

export function useGearApi() {
  const { request, forwardSessionCookie } = useGearRequest()
  const { user } = useSession()
  const nuxtApp = useNuxtApp()

  return async function <T>(path: string, options?: GearRequestOptions) {
    try {
      return await request(path, { ...options, onResponse: forwardSessionCookie, retry: 0 }) as T
    } catch (error) {
      if (apiStatus(error) === 401) {
        user.value = null
        if (import.meta.client) await nuxtApp.runWithContext(() => navigateTo('/login', { replace: true }))
      }
      throw error
    }
  }
}
