import type { ApiError } from '#shared/types/api'

interface RequestError {
  statusCode?: number
  status?: number
  data?: { statusCode?: number, data?: ApiError }
}

export function apiStatus(error: unknown) {
  const response = error as RequestError | undefined
  return response?.statusCode ?? response?.status ?? response?.data?.statusCode
}

export function apiMessage(error: unknown) {
  switch (apiStatus(error)) {
    case 400: return 'Проверьте введённые данные.'
    case 401: return 'Сессия завершилась. Войдите снова.'
    case 403: return 'У вас нет прав на это действие.'
    case 404: return 'Запись не найдена.'
    case 409: return (error as RequestError)?.data?.data?.error ?? 'Данные уже изменились. Обновите страницу и попробуйте снова.'
    case 500: return 'Ошибка сервиса Gear Slot. Попробуйте позже.'
    default: return 'Не удалось связаться с сервисом Gear Slot. Попробуйте ещё раз.'
  }
}
