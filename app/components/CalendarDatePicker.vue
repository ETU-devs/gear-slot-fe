<script setup lang="ts">
import { toCalendarDate } from '@internationalized/date'
import type { CalendarDate, DateValue } from '@internationalized/date'

defineProps<{ label: string, disabled?: boolean, errorId?: string }>()
const date = defineModel<CalendarDate>()
const open = ref(false)
const dateLabel = computed(() => date.value?.toString().split('-').reverse().join('.') ?? 'ДД.ММ.ГГГГ')

function selectDate(value?: DateValue) {
  if (!value) return
  date.value = toCalendarDate(value)
  open.value = false
}
</script>

<template>
  <UPopover
    v-model:open="open"
    :content="{ align: 'start' }"
    :ui="{ content: 'max-h-(--reka-popover-content-available-height) overflow-y-auto rounded-xl p-2 shadow-xl' }"
  >
    <UButton
      :label="dateLabel"
      :aria-label="`${label}: ${dateLabel}. Открыть календарь`"
      :aria-invalid="errorId ? true : undefined"
      :aria-describedby="errorId"
      :color="errorId ? 'error' : 'neutral'"
      :class="{ 'text-muted': !date }"
      :disabled="disabled"
      type="button"
      variant="outline"
      icon="i-lucide-calendar-days"
      class="w-full justify-start"
    />
    <template #content>
      <UCalendar
        :model-value="date"
        :range="false"
        :multiple="false"
        :week-starts-on="1"
        size="sm"
        prevent-deselect
        @update:model-value="selectDate"
      />
    </template>
  </UPopover>
</template>
