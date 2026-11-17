<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Регистрация' })
</script>

<template>
  <section class="glass auth-card">
    <span class="feature-icon"><UIcon name="i-lucide-user-round-plus" /></span>
    <h1>Создать аккаунт</h1>
    <p>Зарегистрируйтесь, чтобы пользоваться каталогом и бронированием.</p>
    <AuthCredentialsForm mode="register" />
    <p class="auth-link">
      Уже есть аккаунт? <NuxtLink to="/login">Войти</NuxtLink>
    </p>
  </section>
</template>
