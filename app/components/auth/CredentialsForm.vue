<script setup lang="ts">
import type { FormError } from '@nuxt/ui'
import { apiMessage, apiStatus } from '~/utils/apiError'

const props = defineProps<{ mode: 'login' | 'register' }>()
const registration = computed(() => props.mode === 'register')
const state = reactive({ email: '', password: '', confirmation: '' })
const pending = ref(false)
const errorMessage = ref('')
const { refresh } = useSession()

function validate(values: typeof state): FormError[] {
  const errors: FormError[] = []
  const email = values.email.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    errors.push({ name: 'email', message: 'Введите корректный email.' })
  }
  if (Array.from(values.password).length < 8) {
    errors.push({ name: 'password', message: 'Введите не менее 8 символов.' })
  } else if (new TextEncoder().encode(values.password).length > 72) {
    errors.push({ name: 'password', message: 'Пароль должен занимать не более 72 байт в UTF-8.' })
  }
  if (registration.value && values.confirmation !== values.password) {
    errors.push({ name: 'confirmation', message: 'Пароли не совпадают.' })
  }
  return errors
}

async function submit() {
  if (pending.value) return
  pending.value = true
  errorMessage.value = ''
  try {
    await $fetch(registration.value ? '/api/auth/register' : '/api/auth/login', {
      method: 'POST',
      body: { email: state.email.trim(), password: state.password }
    })
    if (registration.value) {
      await navigateTo({ path: '/login', query: { registered: '1' } })
    } else if (await refresh()) {
      await navigateTo('/equipment')
    } else {
      errorMessage.value = 'Не удалось сохранить сессию. Проверьте, что браузер принимает cookie.'
    }
  } catch (error) {
    const status = apiStatus(error)
    if (registration.value && status === 409) {
      errorMessage.value = 'Этот email уже зарегистрирован.'
    } else if (!registration.value && status === 401) {
      errorMessage.value = 'Неверный email или пароль.'
    } else {
      errorMessage.value = apiMessage(error)
    }
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <UForm
    :state="state"
    :validate="validate"
    class="form-stack"
    :disabled="pending"
    @submit="submit"
  >
    <UFormField
      name="email"
      label="Электронная почта"
      required
    >
      <UInput
        v-model="state.email"
        type="email"
        autocomplete="email"
        placeholder="name@example.com"
        size="lg"
        class="w-full"
      />
    </UFormField>
    <UFormField
      name="password"
      label="Пароль"
      :hint="registration ? 'От 8 символов' : undefined"
      required
    >
      <UInput
        v-model="state.password"
        type="password"
        :autocomplete="registration ? 'new-password' : 'current-password'"
        size="lg"
        class="w-full"
      />
    </UFormField>
    <UFormField
      v-if="registration"
      name="confirmation"
      label="Подтверждение пароля"
      required
    >
      <UInput
        v-model="state.confirmation"
        type="password"
        autocomplete="new-password"
        size="lg"
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
    <UButton
      type="submit"
      :loading="pending"
      size="lg"
      block
      trailing-icon="i-lucide-arrow-right"
    >
      {{ registration ? 'Создать аккаунт' : 'Войти' }}
    </UButton>
  </UForm>
</template>
