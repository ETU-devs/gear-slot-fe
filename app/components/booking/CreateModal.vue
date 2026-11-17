<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import type { Booking, Equipment } from '#shared/types/api'
import { apiMessage } from '~/utils/apiError'

const props = defineProps<{ item: Equipment }>()
const open = defineModel<boolean>('open', { required: true })
const state = reactive({ start: '', end: '' })
const pending = ref(false)
const errorMessage = ref('')
const api = useGearApi()
const toast = useToast()

watch(open, (value) => {
  if (value) {
    Object.assign(state, { start: '', end: '' })
    errorMessage.value = ''
  }
})

function parseLocal(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null
  const date = new Date(value)
  if (!Number.isFinite(date.getTime()) || date.getFullYear() < 1) return null

  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16) === value ? date : null
}

function validate(values: typeof state): FormError[] {
  const errors: FormError[] = []
  const start = parseLocal(values.start)
  const end = parseLocal(values.end)
  if (!start) errors.push({ name: 'start', message: 'Укажите корректное местное время начала.' })
  if (!end) errors.push({ name: 'end', message: 'Укажите корректное местное время окончания.' })
  if (start && end && start >= end) {
    errors.push({ name: 'end', message: 'Окончание должно быть позже начала.' })
  }
  return errors
}

async function submit() {
  if (pending.value || props.item.status !== 'available') return
  const start = parseLocal(state.start)
  const end = parseLocal(state.end)
  if (!start || !end || start >= end) return
  pending.value = true
  errorMessage.value = ''
  try {
    await api<Booking>('/api/bookings', {
      method: 'POST',
      body: { equipment_id: props.item.id, start_time: start.toISOString(), end_time: end.toISOString() }
    })
    open.value = false
    toast.add({ title: 'Бронирование создано', description: props.item.name, color: 'success', icon: 'i-lucide-calendar-check' })
  } catch (error) {
    errorMessage.value = apiMessage(error)
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
        <UFormField
          name="start"
          label="Начало"
          required
        >
          <UInput
            v-model="state.start"
            type="datetime-local"
            class="w-full"
          />
        </UFormField>
        <UFormField
          name="end"
          label="Окончание"
          required
        >
          <UInput
            v-model="state.end"
            type="datetime-local"
            class="w-full"
          />
        </UFormField>
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
