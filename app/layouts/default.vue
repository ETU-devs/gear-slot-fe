<script setup lang="ts">
import { apiMessage } from '~/utils/apiError'

const { user } = useSession()
const toast = useToast()
const signingOut = ref(false)
const links = [
  { to: '/equipment', icon: 'i-lucide-layout-grid', label: 'Оборудование' },
  { to: '/bookings', icon: 'i-lucide-calendar-days', label: 'Мои бронирования' }
]

async function logout() {
  if (signingOut.value) return
  signingOut.value = true
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    clearNuxtData(key => key.startsWith('gear:'))
    await navigateTo('/login', { replace: true })
  } catch (error) {
    toast.add({ title: 'Не удалось выйти', description: apiMessage(error), color: 'error' })
  } finally {
    signingOut.value = false
  }
}
</script>

<template>
  <div class="workspace">
    <header class="topbar">
      <div class="shell topbar-inner">
        <LayoutBrand />
        <nav
          class="main-nav"
          aria-label="Основная навигация"
        >
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            active-class="nav-active"
          >
            <UIcon :name="link.icon" /> {{ link.label }}
          </NuxtLink>
        </nav>
        <div class="topbar-actions">
          <LayoutThemeToggle />
          <UDropdownMenu
            v-if="user"
            :ui="{ content: 'max-w-64', label: 'break-all' }"
            :items="[
              [{ type: 'label', label: user.email }, { type: 'label', label: user.role === 'admin' ? 'Администратор' : 'Пользователь' }],
              [{ label: 'Выйти', icon: 'i-lucide-log-out', onSelect: logout, disabled: signingOut }]
            ]"
          >
            <UButton
              color="neutral"
              variant="ghost"
              :loading="signingOut"
              aria-label="Аккаунт и выход"
            >
              <span
                class="avatar"
                aria-hidden="true"
              >{{ user.email.slice(0, 1).toUpperCase() }}</span>
              <span class="account-email">{{ user.email }}</span>
              <UIcon name="i-lucide-chevron-down" />
            </UButton>
          </UDropdownMenu>
        </div>
      </div>
    </header>

    <UMain
      id="content"
      class="shell content"
    >
      <slot />
    </UMain>

    <footer class="shell footer">
      <span>Gear Slot</span>
      <span>Бронирование оборудования</span>
    </footer>
  </div>
</template>
