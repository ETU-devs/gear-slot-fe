import type { EquipmentAvailability } from '#shared/types/api'

export default defineEventHandler(event => backend<EquipmentAvailability>(
  event,
  `/api/equipment/${equipmentId(event)}/availability`,
  { query: getQuery(event) }
))
