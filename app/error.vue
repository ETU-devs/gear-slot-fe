<script setup lang="ts">
import { ru } from '@nuxt/ui/locale'
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
useHead({ htmlAttrs: { lang: 'ru' }, title: 'Gear Slot' })
</script>

<template>
  <UApp :locale="ru">
    <NuxtLayout name="auth">
      <section class="glass auth-card">
        <h1>{{ error.statusCode === 404 ? 'Страница не найдена' : 'Не удалось открыть страницу' }}</h1>
        <p>{{ error.statusCode === 404 ? 'Проверьте адрес или перейдите на главную.' : 'Сервис Gear Slot временно недоступен.' }}</p>
        <div class="error-actions">
          <UButton
            v-if="error.statusCode !== 404"
            icon="i-lucide-refresh-cw"
            @click="reloadNuxtApp()"
          >
            Повторить
          </UButton>
          <UButton
            to="/"
            color="neutral"
            variant="soft"
            @click="clearError({ redirect: '/' })"
          >
            На главную
          </UButton>
        </div>
      </section>
    </NuxtLayout>
  </UApp>
</template>
