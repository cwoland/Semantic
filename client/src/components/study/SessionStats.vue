<template>
  <div class="summary">

    <div class="summary__icon" aria-hidden="true">
      <i class="ti ti-circle-check" />
    </div>

    <h2 class="summary__title">Session complete</h2>

    <p class="summary__deck text-muted">{{ deckName }}</p>

    <div class="summary__stats">
      <div class="stat-card">
        <span class="stat-card__value">{{ progress.total }}</span>
        <span class="stat-card__label">Cards reviewed</span>
      </div>
      <div class="stat-card stat-card--good">
        <span class="stat-card__value">{{ progress.correct }}</span>
        <span class="stat-card__label">Correct</span>
      </div>
      <div class="stat-card stat-card--again">
        <span class="stat-card__value">{{ progress.incorrect }}</span>
        <span class="stat-card__label">Needs work</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__value">{{ retentionDisplay }}%</span>
        <span class="stat-card__label">Retention</span>
      </div>
    </div>

    <div class="summary__streak" v-if="streakStore.todayGoalMet">
      <i class="ti ti-flame flame-pulse" aria-hidden="true" />
      <span>Daily goal met — <strong>{{ streakStore.currentStreak }} day streak</strong></span>
    </div>

    <div class="summary__actions">
      <button class="btn btn--primary" @click="$emit('study-again')">
        <i class="ti ti-refresh" aria-hidden="true" />
        Study again
      </button>
      <RouterLink :to="{ name: 'decks' }" class="btn btn--ghost">
        <i class="ti ti-stack-2" aria-hidden="true" />
        Back to decks
      </RouterLink>
      <RouterLink :to="{ name: 'stats' }" class="btn btn--ghost">
        <i class="ti ti-chart-line" aria-hidden="true" />
        View stats
      </RouterLink>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStreakStore } from '@/stores/streak.store'

const props = defineProps({
  progress: { type: Object, required: true },
  deckName: { type: String, default: '' },
})

defineEmits(['study-again'])

const streakStore = useStreakStore()

const retentionDisplay = computed(() => {
  const t = props.progress.total
  if (!t) return 0
  return Math.round((props.progress.correct / t) * 100)
})
</script>

<style scoped>
.summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  max-width: 480px;
  width: 100%;
  text-align: center;
}

.summary__icon .ti {
  font-size: 48px;
  color: var(--color-accent);
}

.summary__title {
  font-size: var(--text-2xl);
  letter-spacing: -0.02em;
}

.summary__deck {
  font-size: var(--text-sm);
  margin-top: calc(-1 * var(--space-4));
}

.summary__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
  width: 100%;
}

.stat-card {
  background: var(--color-surface-2);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.stat-card__value {
  font-size: var(--text-xl);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  line-height: 1;
}

.stat-card__label {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.stat-card--good .stat-card__value  { color: var(--color-good);  }
.stat-card--again .stat-card__value { color: var(--color-again); }

.summary__streak {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  background: var(--color-accent-faint);
  border: 1px solid rgba(201, 168, 76, 0.2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-full);
}

.summary__streak .ti-flame { color: var(--color-accent); font-size: 16px; }
.summary__streak strong    { color: var(--color-accent); }

.summary__actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 140ms ease, border-color 140ms ease, transform 80ms ease;
  text-decoration: none;
}

.btn:hover  { transform: translateY(-1px); }
.btn:active { transform: translateY(0); }

.btn--primary {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border-color: var(--color-accent);
}

.btn--primary:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

.btn--ghost {
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  border-color: var(--color-border-strong);
}

.btn--ghost:hover {
  background: var(--color-surface-3);
  color: var(--color-text);
}
</style>