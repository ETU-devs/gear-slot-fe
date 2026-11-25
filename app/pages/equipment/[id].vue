<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'
import type { Equipment } from '#shared/types/api'
import { apiMessage, apiStatus } from '~/utils/apiError'
import { equipmentVisual } from '~/utils/equipment'

definePageMeta({ requiresAuth: true, key: route => route.path })

const route = useRoute()
const api = useGearApi()
const id = String(route.params.id)
const backToCatalog = computed(() => ({
  path: '/equipment',
  query: { search: route.query.search, status: route.query.status }
}))
const bookOpen = ref(false)
const availabilityDate = shallowRef<CalendarDate>()
const availability = useTemplateRef('availability')
const { data: item, status, error, refresh } = await useAsyncData(
  `gear:equipment:${id}`,
  (_app, { signal }) => api<Equipment>(`/api/equipment/${encodeURIComponent(id)}`, { signal }),
  { lazy: true }
)

const errorStatus = computed(() => apiStatus(error.value))
if (import.meta.server && errorStatus.value === 401) await navigateTo('/login', { replace: true })

const visual = computed(() => equipmentVisual(item.value?.name ?? ''))
const available = computed(() => item.value?.status === 'available')
const errorTitle = computed(() => {
  if (errorStatus.value === 404) return 'Оборудование не найдено'
  if (errorStatus.value === 400) return 'Некорректный номер оборудования'
  return 'Не удалось загрузить оборудование'
})
useSeoMeta({ title: () => item.value?.name ?? 'Оборудование' })
</script>

<template>
  <div class="page-stack">
    <UButton
      :to="backToCatalog"
      color="neutral"
      variant="soft"
      icon="i-lucide-arrow-left"
      class="justify-self-start"
    >
      Назад к каталогу
    </UButton>

    <div
      v-if="status === 'idle' || status === 'pending'"
      role="status"
      aria-label="Загрузка оборудования"
    >
      <USkeleton class="h-72 rounded-3xl" />
    </div>
    <section
      v-else-if="error"
      class="glass list-state"
      role="alert"
    >
      <span class="feature-icon">
        <UIcon :name="errorStatus === 404 ? 'i-lucide-package-open' : 'i-lucide-circle-alert'" />
      </span>
      <h1>{{ errorTitle }}</h1>
      <p v-if="errorStatus === 404">
        Проверьте ссылку или выберите оборудование в каталоге.
      </p>
      <p v-else-if="errorStatus !== 400">
        {{ apiMessage(error) }}
      </p>
      <UButton
        v-if="errorStatus !== 400 && errorStatus !== 401 && errorStatus !== 404"
        variant="soft"
        icon="i-lucide-refresh-cw"
        @click="refresh()"
      >
        Повторить
      </UButton>
    </section>
    <template v-else-if="item">
      <article
        class="glass grid overflow-hidden rounded-3xl md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
        aria-labelledby="equipment-title"
      >
        <div
          class="equipment-visual min-h-40 items-center justify-center md:border-r md:border-b-0"
          :data-tone="visual.tone"
          aria-hidden="true"
        >
          <span class="equipment-icon size-24 rounded-3xl text-5xl md:size-32 md:text-6xl">
            <UIcon :name="visual.icon" />
          </span>
        </div>
        <div class="grid min-w-0 justify-items-start gap-4 p-5 sm:p-8">
          <span
            class="status-pill"
            :data-available="available"
          >
            <span />{{ available ? 'Доступно' : 'На обслуживании' }}
          </span>
          <h1 id="equipment-title">
            {{ item.name }}
          </h1>
          <p class="wrap-anywhere whitespace-pre-wrap">
            {{ item.description || 'Описание пока не добавлено.' }}
          </p>
          <div class="grid w-full gap-3 border-t border-default pt-4">
            <p v-if="available">
              Выберите время начала и окончания, чтобы забронировать оборудование.
            </p>
            <UButton
              size="lg"
              icon="i-lucide-calendar-plus"
              :disabled="!available"
              class="justify-center sm:justify-self-start"
              @click="bookOpen = true"
            >
              Забронировать
            </UButton>
          </div>
        </div>
      </article>
      <EquipmentAvailability
        ref="availability"
        v-model="availabilityDate"
        :equipment-id="item.id"
        :maintenance="!available"
        @book="bookOpen = true"
      />
      <BookingCreateModal
        v-model:open="bookOpen"
        :item="item"
        :initial-date="availabilityDate"
        @created="availability?.refresh()"
        @conflict="availability?.refresh()"
      />
    </template>
  </div>
</template>
