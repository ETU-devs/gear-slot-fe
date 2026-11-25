<script setup lang="ts">
import { Time } from '@internationalized/date'
import type { CalendarDate } from '@internationalized/date'

defineProps<{ label: string, dateField: string, timeField: string, disabled?: boolean }>()
const date = defineModel<CalendarDate>('date')
const time = defineModel<Time>('time')
const dateErrorId = useId()
</script>

<template>
  <fieldset class="min-w-0 rounded-xl border border-default p-3">
    <legend class="px-1 text-sm font-semibold">
      {{ label }}
    </legend>
    <div class="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
      <UFormField
        :name="dateField"
        label="Дата"
        required
      >
        <template #default="{ error }">
          <CalendarDatePicker
            v-model="date"
            :label="`${label}. Дата`"
            :error-id="error ? dateErrorId : undefined"
            :disabled="disabled"
          />
        </template>
        <template #error="{ error }">
          <span
            v-if="error"
            :id="dateErrorId"
          >{{ error }}</span>
        </template>
      </UFormField>
      <UFormField
        :name="timeField"
        label="Время"
        required
      >
        <UInputTime
          :model-value="time"
          :range="false"
          :hour-cycle="24"
          :disabled="disabled"
          granularity="minute"
          class="w-full rounded-xl"
          @update:model-value="time = $event ? new Time($event.hour, $event.minute) : undefined"
        />
      </UFormField>
    </div>
  </fieldset>
</template>
