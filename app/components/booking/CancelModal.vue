<script setup lang="ts">
import type { Booking } from '#shared/types/api'
import { apiMessage, apiStatus } from '~/utils/apiError'

const props = defineProps<{ booking: Booking, name: string }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ cancelled: [id: number] }>()
const pending = ref(false)
const errorMessage = ref('')
const api = useGearApi()
const toast = useToast()

watch(open, (value) => {
  if (value) errorMessage.value = ''
})

async function cancel() {
  if (pending.value) return
  const id = props.booking.id
  pending.value = true
  errorMessage.value = ''
  try {
    await api(`/api/bookings/${id}`, { method: 'DELETE' })
    open.value = false
    emit('cancelled', id)
    toast.add({ title: 'Бронирование отменено', color: 'success', icon: 'i-lucide-circle-check' })
  } catch (error) {
    if (apiStatus(error) === 404) {
      open.value = false
      emit('cancelled', id)
      toast.add({ title: 'Бронирование уже недоступно', color: 'neutral' })
    } else {
      errorMessage.value = apiMessage(error)
    }
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Отменить бронирование?"
    :description="`Интервал для «${name}» освободится.`"
    :close="!pending"
    :dismissible="!pending"
  >
    <template
      v-if="errorMessage"
      #body
    >
      <UAlert
        role="alert"
        color="error"
        variant="soft"
        :description="errorMessage"
      />
    </template>
    <template #footer>
      <div class="dialog-actions">
        <UButton
          color="neutral"
          variant="soft"
          :disabled="pending"
          @click="open = false"
        >
          Оставить бронь
        </UButton>
        <UButton
          color="error"
          :loading="pending"
          @click="cancel"
        >
          Отменить бронь
        </UButton>
      </div>
    </template>
  </UModal>
</template>
