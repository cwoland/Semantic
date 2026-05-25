<template>
  <header class="topbar">
    <div class="topbar__left">
      <slot name="left" />
      <h1 class="topbar__title" v-if="title">{{ title }}</h1>
    </div>

    <div class="topbar__center">
      <slot name="center" />
    </div>

    <div class="topbar__right">
      <slot name="right" />

      <StreakBadge
        :count="streakStore.currentStreak"
        :status="streakStore.streakStatus"
        :show-label="false"
        v-if="streakStore.currentStreak > 0"
      />

      <button class="topbar__cmd-btn" @click="palette.open()" title="Command palette (⌘K)">
        <i class="ti ti-command" aria-hidden="true" />
        <kbd>⌘K</kbd>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useStreakStore }     from '@/stores/streak.store'
import { useCommandPalette } from '@/composables/useCommandPalette'
import StreakBadge           from '@/components/shared/StreakBadge.vue'

defineProps({
  title: { type: String, default: '' },
})

const streakStore = useStreakStore()
const palette     = useCommandPalette()
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: 0 var(--space-6);
  height: 56px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: var(--z-sidebar);
}

.topbar__left,
.topbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.topbar__center { flex: 1; display: flex; justify-content: center; }

.topbar__title {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
}

.topbar__cmd-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-strong);
  cursor: pointer;
  transition: color 140ms, border-color 140ms;
}
.topbar__cmd-btn:hover { color: var(--color-text); border-color: var(--color-accent); }
.topbar__cmd-btn .ti { font-size: 14px; }
</style>