import type { Equipment } from '#shared/types/api'

export default defineEventHandler(event => backend<Equipment>(event, `/api/equipment/${equipmentId(event)}`))
