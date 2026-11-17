<script setup lang="ts">
import type { Booking, Equipment } from '#shared/types/api'
import { apiMessage } from '~/utils/apiError'
import { equipmentVisual } from '~/utils/equipment'

definePageMeta({ requiresAuth: true })
useSeoMeta({ title: 'Мои бронирования' })

const api = useGearApi()
const { user } = useSession()
const selected = shallowRef<Booking>()
const cancelOpen = ref(false)
const timeZone = ref('UTC')

onMounted(() => {
  timeZone.value = Intl.DateTimeFormat().resolvedOptions().timeZone
})

const formatter = computed(() => new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: timeZone.value,
  timeZoneName: 'short'
}))

const { data, status, error, refresh } = await useAsyncData('gear:bookings', async (_app, { signal }) => {
  const [bookings, equipment] = await Promise.allSettled([
    api<Booking[]>('/api/bookings', { signal }),
    api<Equipment[]>('/api/equipment', { signal })
  ])
  if (bookings.status === 'rejected') throw bookings.reason
  return {
    bookings: bookings.value.filter(booking => booking.user_id === user.value?.id),
    equipment: equipment.status === 'fulfilled' ? equipment.value : [],
    namesUnavailable: equipment.status === 'rejected'
  }
})

const names = computed(() => new Map(data.value?.equipment.map(item => [item.id, item.name])))

function equipmentName(id: number) {
  return names.value.get(id) ?? `Оборудование №${id}`
}

function confirmCancel(booking: Booking) {
  selected.value = booking
  cancelOpen.value = true
}

function onCancelled(id: number) {
  if (data.value) data.value = { ...data.value, bookings: data.value.bookings.filter(booking => booking.id !== id) }
  refresh()
}
</script>

<template>
  <div class="page-stack">
    <section class="glass page-hero">
      <div class="hero-content">
        <span class="feature-icon"><UIcon name="i-lucide-calendar-days" /></span>
        <h1>Мои бронирования</h1>
        <p>Просматривайте свои бронирования и освобождайте интервалы, если планы изменились.</p>
      </div>
      <div
        class="hero-art"
        aria-hidden="true"
      >
        <span class="hero-orbit" />
        <span class="hero-object"><UIcon name="i-lucide-calendar-check-2" /></span>
        <span class="hero-mini"><UIcon name="i-lucide-clock-3" /></span>
      </div>
    </section>

    <section
      class="catalog-section"
      aria-labelledby="booking-results"
      :aria-busy="status === 'pending'"
    >
      <div class="section-heading">
        <h2 id="booking-results">
          Список бронирований
        </h2>
        <UButton
          to="/equipment"
          icon="i-lucide-layout-grid"
          variant="soft"
        >
          Перейти в каталог
        </UButton>
      </div>
      <div
        v-if="status === 'pending'"
        class="booking-list"
        role="status"
        aria-label="Загрузка бронирований"
      >
        <USkeleton
          v-for="n in 2"
          :key="n"
          class="booking-skeleton"
        />
      </div>
      <div
        v-else-if="error"
        class="glass list-state"
        role="alert"
      >
        <span class="feature-icon"><UIcon name="i-lucide-wifi-off" /></span>
        <h3>Не удалось загрузить бронирования</h3>
        <p>{{ apiMessage(error) }}</p>
        <UButton
          variant="soft"
          icon="i-lucide-refresh-cw"
          @click="refresh()"
        >
          Повторить
        </UButton>
      </div>
      <div
        v-else-if="!data?.bookings.length"
        class="glass list-state"
        role="status"
      >
        <span class="feature-icon"><UIcon name="i-lucide-calendar-plus" /></span>
        <h3>У вас пока нет бронирований</h3>
        <p>Выберите оборудование в каталоге, чтобы забронировать время.</p>
        <UButton
          to="/equipment"
          trailing-icon="i-lucide-arrow-right"
        >
          Открыть каталог
        </UButton>
      </div>
      <template v-else>
        <UAlert
          v-if="data.namesUnavailable"
          color="warning"
          variant="soft"
          title="Не удалось загрузить названия оборудования"
        >
          <template #actions>
            <UButton
              variant="soft"
              @click="refresh()"
            >
              Повторить
            </UButton>
          </template>
        </UAlert>
        <ul class="booking-list">
          <li
            v-for="booking in data.bookings"
            :key="booking.id"
            class="glass booking-card"
          >
            <div class="booking-heading">
              <span class="feature-icon"><UIcon :name="equipmentVisual(equipmentName(booking.equipment_id)).icon" /></span>
              <h3>{{ equipmentName(booking.equipment_id) }}</h3>
            </div>
            <dl class="booking-dates">
              <div>
                <dt>Начало</dt>
                <dd><time :datetime="booking.start_time">{{ formatter.format(new Date(booking.start_time)) }}</time></dd>
              </div>
              <div>
                <dt>Окончание</dt>
                <dd><time :datetime="booking.end_time">{{ formatter.format(new Date(booking.end_time)) }}</time></dd>
              </div>
            </dl>
            <UButton
              color="error"
              variant="soft"
              icon="i-lucide-calendar-x"
              @click="confirmCancel(booking)"
            >
              Отменить
            </UButton>
          </li>
        </ul>
      </template>
    </section>

    <BookingCancelModal
      v-if="selected"
      v-model:open="cancelOpen"
      :booking="selected"
      :name="equipmentName(selected.equipment_id)"
      @cancelled="onCancelled"
    />
  </div>
</template>
