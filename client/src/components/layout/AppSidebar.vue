<template>
  <aside class="sidebar">

    <div class="sidebar__brand">
      <span class="brand__name">Semantic</span>
      <span class="brand__lang" v-if="targetLang">{{ targetLang.toUpperCase() }}</span>
    </div>

    <nav class="sidebar__nav" aria-label="Main navigation">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="nav-item"
        :class="{ 'nav-item--active': isActive(item) }"
        :aria-label="item.label"
      >
        <i :class="['ti', item.icon]" aria-hidden="true" />
        <span class="nav-item__label">{{ item.label }}</span>
        <kbd class="nav-item__hint" v-if="item.hint">{{ item.hint }}</kbd>
      </RouterLink>
    </nav>

    <div class="sidebar__spacer" />

    <div class="sidebar__streak" v-if="currentStreak > 0">
      <div class="streak__flame" :class="{ 'flame-pulse': streakStatus === 'active' }">
        <i class="ti ti-flame" aria-hidden="true" />
      </div>
      <div class="streak__info">
        <span class="streak__count">{{ currentStreak }}</span>
        <span class="streak__label">day streak</span>
      </div>
      <div
        class="streak__bar"
        role="progressbar"
        :aria-valuenow="todayProgressPercent"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="streak__fill" :style="{ width: todayProgressPercent + '%' }" />
      </div>
    </div>

    <div class="sidebar__bottom">
      <button class="bottom-btn" @click="palette.open()" title="Command palette">
        <i class="ti ti-command" aria-hidden="true" />
        <span>Command</span>
        <kbd>⌘K</kbd>
      </button>

      <RouterLink :to="{ name: 'settings' }" class="bottom-btn">
        <i class="ti ti-settings" aria-hidden="true" />
        <span>Settings</span>
      </RouterLink>
    </div>

  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings.store'
import { useStreakStore }   from '@/stores/streak.store'
import { useCommandPalette } from '@/composables/useCommandPalette'

const route        = useRoute()
const settings     = useSettingsStore()
const streakStore  = useStreakStore()
const palette      = useCommandPalette()

const targetLang         = computed(() => settings.targetLanguage)
const currentStreak      = computed(() => streakStore.currentStreak)
const streakStatus       = computed(() => streakStore.streakStatus)
const todayProgressPercent = computed(() => streakStore.todayProgressPercent)

const navItems = [
  { name: 'dashboard', label: 'Dashboard',  icon: 'ti-layout-dashboard', to: { name: 'dashboard' },  hint: 'gh' },
  { name: 'decks',     label: 'Decks',       icon: 'ti-stack-2',          to: { name: 'decks' },      hint: 'gd' },
  { name: 'vocab',     label: 'Vocabulary',  icon: 'ti-book-2',           to: { name: 'vocab' },      hint: 'gv' },
  { name: 'immersion', label: 'Immersion',   icon: 'ti-eye',              to: { name: 'immersion' },  hint: 'gi' },
  { name: 'stats',     label: 'Statistics',  icon: 'ti-chart-line',       to: { name: 'stats' },      hint: 'gt' },
]

function isActive(item) {
  return route.name === item.name
    || route.name?.startsWith(item.name)
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-height: 100vh;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: var(--space-4) 0;
  position: sticky;
  top: 0;
  z-index: var(--z-sidebar);
  flex-shrink: 0;
}

.sidebar__brand {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-5) var(--space-6);
}

.brand__name {
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.brand__lang {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--color-accent);
  letter-spacing: 0.08em;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 var(--space-3);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  transition: color 160ms ease, background 160ms ease;
  text-decoration: none;
  cursor: pointer;
  position: relative;
}

.nav-item:hover {
  color: var(--color-text);
  background: var(--color-surface-2);
}

.nav-item--active {
  color: var(--color-text);
  background: var(--color-surface-2);
}

.nav-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 25%;
  height: 50%;
  width: 2px;
  background: var(--color-accent);
  border-radius: var(--radius-full);
}

.nav-item .ti {
  font-size: 16px;
  flex-shrink: 0;
}

.nav-item__label {
  flex: 1;
}

.nav-item__hint {
  opacity: 0;
  transition: opacity 160ms ease;
  font-size: 10px;
}

.nav-item:hover .nav-item__hint {
  opacity: 1;
}

.sidebar__spacer { flex: 1; }

.sidebar__streak {
  margin: 0 var(--space-3) var(--space-4);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
}

.streak__flame {
  font-size: 20px;
  color: var(--color-accent);
  display: inline-block;
  margin-bottom: var(--space-1);
}

.streak__info {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
  margin-bottom: var(--space-2);
}

.streak__count {
  font-size: var(--text-xl);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  line-height: 1;
}

.streak__label {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.streak__bar {
  height: 2px;
  background: var(--color-surface-3);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.streak__fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width 600ms cubic-bezier(0.22, 1, 0.36, 1);
}

.sidebar__bottom {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 var(--space-3);
}

.bottom-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  transition: color 160ms ease, background 160ms ease;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.bottom-btn:hover {
  color: var(--color-text-muted);
  background: var(--color-surface-2);
}

.bottom-btn .ti {
  font-size: 16px;
  flex-shrink: 0;
}

.bottom-btn span { flex: 1; }

.bottom-btn kbd {
  opacity: 0;
  transition: opacity 160ms ease;
}

.bottom-btn:hover kbd { opacity: 1; }
</style>