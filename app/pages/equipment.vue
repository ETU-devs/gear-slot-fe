<script setup lang="ts">
import type { Equipment, EquipmentStatus } from '#shared/types/api'
import { equipmentStatuses } from '~/utils/equipment'
import { apiMessage } from '~/utils/apiError'

definePageMeta({ requiresAuth: true })
useSeoMeta({ title: 'Оборудование' })

const route = useRoute()
const router = useRouter()
const { user } = useSession()
const api = useGearApi()
const searchQuery = computed(() => typeof route.query.search === 'string' ? route.query.search : '')
const statusQuery = computed(() => {
  const status = route.query.status
  return status === 'available' || status === 'maintenance' ? status : 'all'
})
const search = ref(searchQuery.value)
const filters: { label: string, value: EquipmentStatus | 'all' }[] = [
  { label: 'Все статусы', value: 'all' },
  ...equipmentStatuses
]
const addOpen = ref(false)
const bookOpen = ref(false)
const selected = shallowRef<Equipment>()
let searchTimer: ReturnType<typeof setTimeout> | undefined

function updateQuery(text: string, status: EquipmentStatus | 'all') {
  clearTimeout(searchTimer)
  search.value = text.trim()
  return router.replace({
    query: { search: search.value || undefined, status: status === 'all' ? undefined : status }
  })
}

function updateSearch(value: string) {
  search.value = value
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => updateQuery(value, statusQuery.value), 300)
}

watch(searchQuery, (value) => {
  clearTimeout(searchTimer)
  search.value = value
})
onScopeDispose(() => clearTimeout(searchTimer))

const { data, status, error, refresh } = await useAsyncData(
  'gear:equipment',
  (_app, { signal }) => api<Equipment[]>('/api/equipment', {
    signal,
    query: {
      search: searchQuery.value || undefined,
      status: statusQuery.value === 'all' ? undefined : statusQuery.value
    }
  }),
  { watch: [searchQuery, statusQuery] }
)

function book(item: Equipment) {
  if (item.status !== 'available') return
  selected.value = item
  bookOpen.value = true
}
</script>

<template>
  <div class="page-stack">
    <section class="glass page-hero">
      <div class="hero-content">
        <span class="feature-icon"><UIcon name="i-lucide-boxes" /></span>
        <h1>Каталог оборудования</h1>
        <p>Найдите нужное оборудование и выберите время бронирования.</p>
      </div>
      <div
        class="hero-art"
        aria-hidden="true"
      >
        <span class="hero-orbit" />
        <span class="hero-object"><UIcon name="i-lucide-box" /></span>
        <span class="hero-mini"><UIcon name="i-lucide-scan-line" /></span>
      </div>
    </section>

    <section
      class="catalog-section"
      aria-labelledby="catalog-results"
      :aria-busy="status === 'pending'"
    >
      <div class="section-heading">
        <h2 id="catalog-results">
          Оборудование
        </h2>
        <UButton
          v-if="user?.role === 'admin'"
          icon="i-lucide-plus"
          @click="addOpen = true"
        >
          Добавить оборудование
        </UButton>
      </div>
      <div class="glass filters">
        <UInput
          :model-value="search"
          aria-label="Поиск по названию"
          placeholder="Поиск по названию"
          icon="i-lucide-search"
          size="lg"
          :maxlength="200"
          @update:model-value="updateSearch"
        />
        <USelect
          :model-value="statusQuery"
          :items="filters"
          aria-label="Статус оборудования"
          icon="i-lucide-list-filter"
          size="lg"
          @update:model-value="updateQuery(search, $event)"
        />
      </div>

      <div
        v-if="status === 'pending'"
        class="equipment-grid"
        role="status"
        aria-label="Загрузка оборудования"
      >
        <USkeleton
          v-for="n in 3"
          :key="n"
          class="card-skeleton"
        />
      </div>
      <div
        v-else-if="error"
        class="glass list-state"
        role="alert"
      >
        <span class="feature-icon"><UIcon name="i-lucide-wifi-off" /></span>
        <h3>Не удалось загрузить каталог</h3>
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
        v-else-if="!data?.length"
        class="glass list-state"
        role="status"
      >
        <span class="feature-icon"><UIcon name="i-lucide-package-open" /></span>
        <h3>{{ searchQuery || statusQuery !== 'all' ? 'Ничего не найдено' : 'Каталог пока пуст' }}</h3>
        <UButton
          v-if="searchQuery || statusQuery !== 'all'"
          variant="soft"
          @click="updateQuery('', 'all')"
        >
          Сбросить фильтры
        </UButton>
      </div>
      <div
        v-else
        class="equipment-grid"
      >
        <EquipmentCard
          v-for="item in data"
          :key="item.id"
          :item="item"
          @book="book"
        />
      </div>
    </section>

    <EquipmentCreateModal
      v-if="user?.role === 'admin'"
      v-model:open="addOpen"
      @created="refresh()"
    />
    <BookingCreateModal
      v-if="selected"
      v-model:open="bookOpen"
      :item="selected"
    />
  </div>
</template>
