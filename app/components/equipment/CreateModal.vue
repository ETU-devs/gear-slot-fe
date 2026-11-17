<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import type { Equipment, EquipmentStatus } from '#shared/types/api'
import { equipmentStatuses } from '~/utils/equipment'
import { apiMessage } from '~/utils/apiError'

const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ created: [] }>()
const state = reactive({ name: '', description: '', status: 'available' as EquipmentStatus })
const pending = ref(false)
const errorMessage = ref('')
const api = useGearApi()
const toast = useToast()

watch(open, (value) => {
  if (value) {
    Object.assign(state, { name: '', description: '', status: 'available' })
    errorMessage.value = ''
  }
})

function validate(values: typeof state): FormError[] {
  const errors: FormError[] = []
  const length = Array.from(values.name.trim()).length
  if (!length || length > 200) {
    errors.push({ name: 'name', message: 'Введите название длиной от 1 до 200 символов.' })
  }
  if (Array.from(values.description).length > 10000) {
    errors.push({ name: 'description', message: 'Введите не более 10 000 символов.' })
  }
  if (!equipmentStatuses.some(item => item.value === values.status)) {
    errors.push({ name: 'status', message: 'Выберите статус.' })
  }
  return errors
}

async function submit() {
  if (pending.value) return
  pending.value = true
  errorMessage.value = ''
  try {
    await api<Equipment>('/api/equipment', {
      method: 'POST',
      body: { name: state.name.trim(), description: state.description.trim(), status: state.status }
    })
    open.value = false
    toast.add({ title: 'Оборудование добавлено', color: 'success', icon: 'i-lucide-circle-check' })
    emit('created')
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
    title="Добавить оборудование"
    description="Новая позиция появится в каталоге."
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
        <UFormField
          name="name"
          label="Название"
          required
        >
          <UInput
            v-model="state.name"
            placeholder="Например, проектор Epson"
            class="w-full"
          />
        </UFormField>
        <UFormField
          name="description"
          label="Описание"
        >
          <UTextarea
            v-model="state.description"
            placeholder="Характеристики и назначение"
            class="w-full"
          />
        </UFormField>
        <UFormField
          name="status"
          label="Статус"
          required
        >
          <USelect
            v-model="state.status"
            :items="equipmentStatuses"
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
            icon="i-lucide-plus"
          >
            Добавить в каталог
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
