<script setup lang="ts">
import { fromDate, getLocalTimeZone, today } from '@internationalized/date'
import type { CalendarDate } from '@internationalized/date'
import type { EquipmentAvailability } from '#shared/types/api'
import { apiMessage, apiStatus } from '~/utils/apiError'
import { clipBusyIntervals, localDayRange } from '~/utils/availability'

const props = defineProps<{ equipmentId: number, maintenance: boolean }>()
defineEmits<{ book: [] }>()
const date = defineModel<CalendarDate>()
const timeZone = ref('')
const api = useGearApi()
const day = computed(() => date.value && timeZone.value ? localDayRange(date.value, timeZone.value) : undefined)

const { data, status, error, refresh, clear } = useAsyncData(
  `gear:availability:${props.equipmentId}`,
  async (_app, { signal }) => {
    const range = day.value
    if (!range) return { from: '', intervals: [] }
    const from = range.start.toISOString()
    const result = await api<EquipmentAvailability>(`/api/equipment/${props.equipmentId}/availability`, {
      signal,
      query: { from, to: range.end.toISOString() }
    })
    return { from, intervals: clipBusyIntervals(result.busy_intervals, range.start, range.end) }
  },
  {
    server: false,
    immediate: false,
    dedupe: 'cancel',
    getCachedData: () => undefined
  }
)

// Start immediately so deduplication can abort a request for the previous date.
watch(day, (range) => {
  if (range) void refresh()
  else clear()
})

onMounted(() => {
  timeZone.value = getLocalTimeZone()
  date.value ??= today(timeZone.value)
})

const intervals = computed(() => data.value?.from === day.value?.start.toISOString() ? data.value?.intervals : undefined)
const formatter = computed(() => {
  const zone = timeZone.value
  const range = day.value
  const hasClockChange = range && fromDate(range.start, zone).offset !== fromDate(new Date(range.end.getTime() - 1), zone).offset
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: zone || 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZoneName: hasClockChange ? 'shortOffset' : undefined
  })
})

function timeLabel(timestamp: number) {
  return timestamp === day.value?.end.getTime() ? '24:00' : formatter.value.format(timestamp)
}

function segmentStyle(start: number, end: number) {
  const range = day.value
  if (!range) return
  const dayStart = range.start.getTime()
  const duration = range.end.getTime() - dayStart
  return { left: `${100 * (start - dayStart) / duration}%`, width: `${100 * (end - start) / duration}%` }
}

defineExpose({ refresh })
</script>

<template>
  <section
    class="glass grid min-w-0 gap-5 rounded-3xl p-5 sm:p-8"
    aria-labelledby="availability-title"
  >
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="flex items-center gap-3">
        <span
          class="feature-icon"
          aria-hidden="true"
        ><UIcon name="i-lucide-calendar-clock" /></span>
        <h2 id="availability-title">
          Доступность оборудования
        </h2>
      </div>
      <UFormField
        label="Дата просмотра"
        class="w-full sm:w-auto"
      >
        <CalendarDatePicker
          v-model="date"
          label="Дата просмотра"
          :disabled="!timeZone"
        />
      </UFormField>
    </div>

    <UAlert
      v-if="maintenance"
      color="warning"
      variant="soft"
      icon="i-lucide-wrench"
      title="Оборудование находится на обслуживании. Бронирование недоступно."
    />

    <div
      v-if="!timeZone || (day && (status === 'idle' || status === 'pending'))"
      role="status"
      aria-label="Загрузка доступности"
    >
      <USkeleton class="h-20 rounded-xl" />
    </div>
    <UAlert
      v-else-if="!day"
      role="alert"
      color="warning"
      variant="soft"
      title="Выберите другую дату"
      description="Эти сутки недоступны в часовом поясе устройства."
    />
    <UAlert
      v-else-if="error"
      role="alert"
      color="error"
      variant="soft"
      :title="apiStatus(error) === 404 ? 'Оборудование не найдено' : 'Не удалось загрузить доступность'"
      :description="apiStatus(error) === 404 ? undefined : apiMessage(error)"
    >
      <template #actions>
        <UButton
          variant="soft"
          icon="i-lucide-refresh-cw"
          @click="refresh()"
        >
          Повторить
        </UButton>
      </template>
    </UAlert>
    <div
      v-else-if="intervals"
      class="grid gap-4"
    >
      <div aria-hidden="true">
        <div class="relative h-3 overflow-hidden rounded-full bg-success/20">
          <span
            v-for="interval in intervals"
            :key="interval.start"
            class="absolute inset-y-0 bg-error/70"
            :style="segmentStyle(interval.start, interval.end)"
          />
        </div>
        <div class="mt-1 flex justify-between text-xs text-muted tabular-nums">
          <span>{{ timeLabel(day.start.getTime()) }}</span>
          <span>24:00</span>
        </div>
      </div>
      <div
        v-if="intervals.length"
        class="grid gap-3"
      >
        <h3>Занятые интервалы</h3>
        <ul class="flex flex-wrap gap-2">
          <li
            v-for="interval in intervals"
            :key="interval.start"
          >
            <UBadge
              color="error"
              variant="soft"
              icon="i-lucide-clock"
              class="tabular-nums"
            >
              {{ timeLabel(interval.start) }}–{{ timeLabel(interval.end) }}
            </UBadge>
          </li>
        </ul>
        <p class="text-sm">
          Зелёные участки свободны от известных бронирований.
        </p>
      </div>
      <p
        v-else
        role="status"
      >
        {{ maintenance ? 'На выбранную дату нет бронирований.' : 'На выбранную дату оборудование свободно' }}
      </p>
    </div>
    <UButton
      v-if="!maintenance"
      variant="soft"
      icon="i-lucide-calendar-plus"
      class="justify-center sm:justify-self-start"
      :disabled="!day"
      @click="$emit('book')"
    >
      Забронировать
    </UButton>
  </section>
</template>
