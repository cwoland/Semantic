<template>
  <div class="streak-card" :class="`streak-card--${streakStore.streakStatus}`">

    <div class="streak-card__top">
      <div class="streak-card__icon" :class="{ 'flame-pulse': streakStore.streakStatus === 'active' }">
        <i class="ti ti-flame" aria-hidden="true" />
      </div>
      <div class="streak-card__numbers">
        <span class="streak-card__value">{{ streakStore.currentStreak }}</span>
        <span class="streak-card__unit">day streak</span>
      </div>
      <span class="streak-card__status-badge">{{ statusLabel }}</span>
    </div>
    <div class="streak-card__goal">
      <div class="streak-card__goal-header">
        <span class="text-muted" style="font-size: var(--text-xs)">Daily goal</span>
        <span class="streak-card__goal-xp">
          {{ streakStore.todayXP }} / {{ streakStore.dailyGoalCards * 10 }} XP
        </span>
      </div>
      <div class="streak-card__bar">
        <div
          class="streak-card__fill"
          :style="{ width: streakStore.todayProgressPercent + '%' }"
          :class="{ 'streak-card__fill--done': streakStore.todayGoalMet }"
        />
      </div>
    </div>

    <div class="streak-card__footer">
      <span class="text-faint" style="font-size: var(--text-xs)">
        Best: <strong style="color: var(--color-text-muted)">{{ streakStore.longestStreak }} days</strong>
      </span>
      <span class="text-faint" style="font-size: var(--text-xs)">
        Total XP: <strong style="color: var(--color-accent)">{{ streakStore.totalXP.toLocaleString() }}</strong>
      </span>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStreakStore } from '@/stores/streak.store'

const streakStore = useStreakStore()

const statusLabel = computed(() => ({
  active:   '🔥 On track',
  'at-risk': '⚠️ Study today',
  broken:   '💀 Broken',
}[streakStore.streakStatus] ?? ''))
</script>

<style scoped>
.streak-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  transition: border-color 200ms;
}

.streak-card--active   { border-color: rgba(201, 168, 76, 0.3); }
.streak-card--at-risk  { border-color: rgba(230, 126, 34, 0.3); }
.streak-card--broken   { border-color: var(--color-border); }

.streak-card__top {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.streak-card__icon {
  font-size: 28px;
  color: var(--color-accent);
  display: inline-flex;
  flex-shrink: 0;
}

.streak-card--broken .streak-card__icon { color: var(--color-text-faint); }
.streak-card--at-risk .streak-card__icon { color: #e67e22; }

.streak-card__numbers {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
  flex: 1;
}

.streak-card__value {
  font-size: var(--text-2xl);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  line-height: 1;
  font-family: var(--font-mono);
}

.streak-card__unit {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.streak-card__status-badge {
  font-size: var(--text-xs);
  padding: 3px var(--space-2);
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.streak-card__goal { display: flex; flex-direction: column; gap: var(--space-2); }

.streak-card__goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.streak-card__goal-xp {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--color-text-faint);
}

.streak-card__bar {
  height: 4px;
  background: var(--color-surface-3);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.streak-card__fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width 600ms cubic-bezier(0.22, 1, 0.36, 1);
}

.streak-card__fill--done { background: var(--color-good); }

.streak-card__footer {
  display: flex;
  justify-content: space-between;
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border-muted);
}
</style>