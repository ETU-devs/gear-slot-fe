<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import type { CalendarDate, Time } from '@internationalized/date'
import type { Booking, Equipment } from '#shared/types/api'
import { apiMessage, apiStatus } from '~/utils/apiError'
import { localBookingDate } from '~/utils/bookingTime'

const props = defineProps<{ item: Equipment, initialDate?: CalendarDate }>()
const emit = defineEmits<{ created: [], conflict: [] }>()
const open = defineModel<boolean>('open', { required: true })
const state = shallowReactive<{
  startDate?: CalendarDate
  startTime?: Time
  endDate?: CalendarDate
  endTime?: Time
}>({})
const pending = ref(false)
const errorMessage = ref('')
const api = useGearApi()
const toast = useToast()

watch(open, (value) => {
  if (value) {
    Object.assign(state, { startDate: props.initialDate, startTime: undefined, endDate: props.initialDate, endTime: undefined })
    errorMessage.value = ''
  }
})

function validate(values: typeof state): FormError[] {
  const errors: FormError[] = []
  const start = localBookingDate(values.startDate, values.startTime)
  const end = localBookingDate(values.endDate, values.endTime)
  if (!values.startDate) errors.push({ name: 'startDate', message: 'Выберите дату начала.' })
  if (!values.endDate) errors.push({ name: 'endDate', message: 'Выберите дату окончания.' })
  if (!values.startTime) errors.push({ name: 'startTime', message: 'Укажите время начала.' })
  else if (values.startDate && !start) errors.push({ name: 'startTime', message: 'Это время недоступно в часовом поясе устройства.' })
  if (!values.endTime) errors.push({ name: 'endTime', message: 'Укажите время окончания.' })
  else if (values.endDate && !end) errors.push({ name: 'endTime', message: 'Это время недоступно в часовом поясе устройства.' })
  if (start && end && start >= end) {
    errors.push({ name: 'endTime', message: 'Окончание должно быть позже начала.' })
  }
  return errors
}

async function submit() {
  if (pending.value || props.item.status !== 'available') return
  const start = localBookingDate(state.startDate, state.startTime)
  const end = localBookingDate(state.endDate, state.endTime)
  if (!start || !end || start >= end) return
  pending.value = true
  errorMessage.value = ''
  try {
    await api<Booking>('/api/bookings', {
      method: 'POST',
      body: { equipment_id: props.item.id, start_time: start.toISOString(), end_time: end.toISOString() }
    })
    open.value = false
    emit('created')
    toast.add({
      title: 'Бронирование создано',
      description: props.item.name,
      color: 'success',
      icon: 'i-lucide-calendar-check',
      actions: [{ label: 'Мои бронирования', to: '/bookings', color: 'success', variant: 'soft' }]
    })
  } catch (error) {
    errorMessage.value = apiMessage(error)
    if (apiStatus(error) === 409) emit('conflict')
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Забронировать оборудование"
    :description="item.name"
    :dismissible="!pending"
    :close="!pending"
  >
    <template #body>
      <UForm
        :state="state"
        :validate="validate"
        class="form-stack"
        :disabled="pending"
        @submit="submit"
      >
        <p>Укажите интервал по местному времени устройства.</p>
        <BookingDateTimePicker
          v-model:date="state.startDate"
          v-model:time="state.startTime"
          date-field="startDate"
          time-field="startTime"
          label="Начало бронирования"
          :disabled="pending"
        />
        <BookingDateTimePicker
          v-model:date="state.endDate"
          v-model:time="state.endTime"
          date-field="endDate"
          time-field="endTime"
          label="Окончание бронирования"
          :disabled="pending"
        />
        <UAlert
          v-if="errorMessage"
          role="alert"
          color="error"
          variant="soft"
          :description="errorMessage"
        />
        <div class="dialog-actions">
          <UButton
            color="neutral"
            variant="ghost"
            :disabled="pending"
            @click="open = false"
          >
            Отмена
          </UButton>
          <UButton
            type="submit"
            :loading="pending"
            :disabled="item.status !== 'available'"
          >
            Забронировать
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
