import type { H3Event } from 'h3'

export function equipmentId(event: H3Event) {
  const id = getRouterParam(event, 'id')
  if (!id || !/^\d+$/.test(id) || !/[1-9]/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', data: { error: 'Некорректный номер оборудования.' } })
  }
  return id
}
