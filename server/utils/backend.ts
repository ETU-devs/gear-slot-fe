import type { H3Event } from 'h3'
import type { ApiError } from '#shared/types/api'

const sessionCookie = 'gear_slot_session'

export function checkOrigin(event: H3Event) {
  const origin = useRuntimeConfig(event).appOrigin || getRequestURL(event).origin
  if (getHeader(event, 'origin') !== origin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden', data: { error: 'Источник запроса не разрешён.' } })
  }
}

function cookieOptions(event: H3Event) {
  const origin = useRuntimeConfig(event).appOrigin || getRequestURL(event).origin
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: origin.startsWith('https://')
  }
}

export function storeSession(event: H3Event, token: string, expiry: string) {
  const expires = new Date(expiry)
  if (!token || !(expires.getTime() > Date.now())) {
    throw createError({ statusCode: 502, statusMessage: 'Bad Gateway', data: { error: 'Сервис вернул недействительную сессию.' } })
  }
  setCookie(event, sessionCookie, token, { ...cookieOptions(event), expires })
}

export function clearGearSession(event: H3Event) {
  deleteCookie(event, sessionCookie, cookieOptions(event))
}

interface BackendOptions {
  auth?: boolean
  method?: 'GET' | 'POST' | 'DELETE'
  body?: unknown
  query?: Record<string, unknown>
}

export async function backend<T>(event: H3Event, path: string, options: BackendOptions = {}): Promise<T> {
  const { auth = true, method = 'GET', body, query } = options

  const token = auth ? getCookie(event, sessionCookie) : undefined
  if (auth && !token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized', data: { error: 'Войдите в аккаунт.' } })
  }
  const url = new URL(path, useRuntimeConfig(event).backendUrl)
  let response: Response & { _data?: T | ApiError }
  try {
    response = await $fetch.raw(url.href, {
      method,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: body as Record<string, unknown> | undefined,
      query,
      timeout: 8000,
      retry: 0,
      redirect: 'error',
      ignoreResponseError: true
    })
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad Gateway',
      data: { error: 'Сервис Gear Slot недоступен. Попробуйте ещё раз.' }
    })
  }

  if (!response.ok) {
    if (auth && response.status === 401) clearGearSession(event)
    const payload = response._data as ApiError | undefined
    throw createError({
      statusCode: response.status,
      statusMessage: 'Backend request failed',
      data: { error: payload?.error }
    })
  }

  setResponseStatus(event, response.status)
  return response._data as T
}
