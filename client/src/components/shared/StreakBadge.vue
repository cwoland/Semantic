<template>
  <div class="streak-badge" :class="`streak-badge--${status}`" :title="tooltip">
    <i
      class="ti ti-flame"
      :class="{ 'flame-pulse': status === 'active' }"
      aria-hidden="true"
    />
    <span class="streak-badge__count">{{ count }}</span>
    <span class="streak-badge__label" v-if="showLabel">{{ labelText }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  count:     { type: Number,  default: 0 },
  status:    { type: String,  default: 'active' }, // 'active' | 'at-risk' | 'broken'
  showLabel: { type: Boolean, default: true },
})

const labelText = computed(() => ({
  active:   'streak',
  'at-risk': 'at risk',
  broken:   'streak',
}[props.status] ?? 'streak'))

const tooltip = computed(() =>
  `${props.count} day streak — ${props.status}`
)
</script>

<style scoped>
.streak-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 3px var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  border: 1px solid transparent;
}

.streak-badge--active {
  background: var(--color-accent-faint);
  border-color: rgba(201, 168, 76, 0.2);
  color: var(--color-accent);
}

.streak-badge--at-risk {
  background: rgba(230, 126, 34, 0.1);
  border-color: rgba(230, 126, 34, 0.2);
  color: #e67e22;
}

.streak-badge--broken {
  background: var(--color-surface-2);
  border-color: var(--color-border);
  color: var(--color-text-faint);
}

.streak-badge__count {
  font-weight: var(--weight-medium);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.streak-badge__label { opacity: 0.8; }
</style>