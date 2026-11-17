import type { EquipmentStatus } from '#shared/types/api'

export const equipmentStatuses: { label: string, value: EquipmentStatus }[] = [
  { label: 'Доступно', value: 'available' },
  { label: 'На обслуживании', value: 'maintenance' }
]

export function equipmentVisual(name: string) {
  if (/проектор|projector/i.test(name)) return { icon: 'i-lucide-projector', tone: 'violet' }
  if (/ноутбук|laptop|macbook|thinkpad/i.test(name)) return { icon: 'i-lucide-laptop', tone: 'blue' }
  if (/камер|camera|canon|фото/i.test(name)) return { icon: 'i-lucide-camera', tone: 'pink' }
  if (/микрофон|microphone|mic\b/i.test(name)) return { icon: 'i-lucide-mic', tone: 'teal' }
  if (/колонк|speaker/i.test(name)) return { icon: 'i-lucide-speaker', tone: 'blue' }
  if (/штатив|tripod/i.test(name)) return { icon: 'i-lucide-pyramid', tone: 'pink' }
  return { icon: 'i-lucide-box', tone: 'violet' }
}
