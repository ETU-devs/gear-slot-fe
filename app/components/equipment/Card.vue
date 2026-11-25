<script setup lang="ts">
import type { Equipment } from '#shared/types/api'
import type { RouteLocationRaw } from 'vue-router'
import { equipmentVisual } from '~/utils/equipment'

const props = defineProps<{ item: Equipment, detailsTo: RouteLocationRaw }>()
defineEmits<{ book: [item: Equipment] }>()
const visual = computed(() => equipmentVisual(props.item.name))
const available = computed(() => props.item.status === 'available')
</script>

<template>
  <article class="glass equipment-card relative">
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
      <h3>
        <NuxtLink
          :to="detailsTo"
          class="after:absolute after:inset-0 after:rounded-[inherit] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-primary"
        >
          {{ item.name }}
        </NuxtLink>
      </h3>
      <p v-if="item.description">
        {{ item.description }}
      </p>
      <UButton
        class="equipment-action relative z-10"
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
