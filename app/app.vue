<script setup lang="ts">
import { ru } from '@nuxt/ui/locale'

const { preference } = useColorMode()
const themeClass = import.meta.server && (preference === 'dark' || preference === 'light') ? preference : undefined

useHead({
  htmlAttrs: { lang: 'ru', class: themeClass },
  link: [{ rel: 'icon', href: '/gear-slot.svg', type: 'image/svg+xml' }]
})
useSeoMeta({
  titleTemplate: '%s · Gear Slot',
  description: 'Каталог и бронирование общего оборудования.'
})
</script>

<template>
  <UApp :locale="ru">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
