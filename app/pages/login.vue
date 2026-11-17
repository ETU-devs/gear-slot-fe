<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Вход' })
const route = useRoute()
</script>

<template>
  <section class="glass auth-card">
    <span class="feature-icon"><UIcon name="i-lucide-log-in" /></span>
    <h1>Вход в Gear Slot</h1>
    <p>Войдите, чтобы забронировать оборудование.</p>
    <UAlert
      v-if="route.query.registered === '1'"
      color="success"
      variant="soft"
      icon="i-lucide-circle-check"
      title="Аккаунт создан"
      description="Теперь войдите с вашим email и паролем."
    />
    <AuthCredentialsForm mode="login" />
    <p class="auth-link">
      Первый раз здесь? <NuxtLink to="/register">Создать аккаунт</NuxtLink>
    </p>
  </section>
</template>
