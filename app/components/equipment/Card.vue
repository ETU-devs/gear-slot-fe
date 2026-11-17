<script setup lang="ts">
import type { Equipment } from '#shared/types/api'
import { equipmentVisual } from '~/utils/equipment'

const props = defineProps<{ item: Equipment }>()
defineEmits<{ book: [item: Equipment] }>()
const visual = computed(() => equipmentVisual(props.item.name))
const available = computed(() => props.item.status === 'available')
</script>

<template>
  <article class="glass equipment-card">
    <div
      class="equipment-visual"
      :data-tone="visual.tone"
    >
      <span class="equipment-icon"><UIcon :name="visual.icon" /></span>
      <span
        class="status-pill"
        :data-available="available"
      >
        <span />{{ available ? 'Доступно' : 'На обслуживании' }}
      </span>
    </div>
    <div class="equipment-body">
      <h3>{{ item.name }}</h3>
      <p v-if="item.description">
        {{ item.description }}
      </p>
      <UButton
        class="equipment-action"
        color="primary"
        variant="soft"
        icon="i-lucide-calendar-plus"
        :disabled="!available"
        block
        @click="$emit('book', item)"
      >
        Забронировать
      </UButton>
    </div>
  </article>
</template>
