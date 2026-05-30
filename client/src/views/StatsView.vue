<template>
  <div class="stats-view">
    <header class="page-header">
      <h1 class="page-title">{{ t.stats_title }}</h1>
      <StreakBadge
        :count="streakStore.currentStreak"
        :status="streakStore.streakStatus"
      />
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-card__value">{{ statsStore.retentionRate }}%</span>
        <span class="stat-card__label">{{ t.stats_retention }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__value">{{ wordsStore.knownCount }}</span>
        <span class="stat-card__label">{{ t.stats_known }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__value">{{ statsStore.avgCardsPerDay }}</span>
        <span class="stat-card__label">{{ t.stats_per_day }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__value">{{ statsStore.totalStudyMinutes }}</span>
        <span class="stat-card__label">{{ t.stats_minutes }}</span>
      </div>
    </div>

    <div class="stats-section">
      <h2 class="section-title">{{ t.stats_retention }}</h2>
      <div class="chart-card">
        <RetentionChart :data="retentionSeries" />
      </div>
    </div>

    <div class="stats-section">
      <h2 class="section-title">{{ t.stats_activity }}</h2>
      <div class="chart-card">
        <Heatmap :data="statsStore.heatmapData" />
      </div>
    </div>

    <div class="stats-section">
      <h2 class="section-title">{{ t.stats_decks }}</h2>
      <div class="deck-breakdown">
        <div
          v-for="deck in decksStore.deckProgress"
          :key="deck.id"
          class="breakdown-row"
        >
          <span class="breakdown-row__name">{{ deck.name }}</span>
          <DeckProgress :words="wordsStore.getWordsByDeck(deck.id)" />
          <span class="breakdown-row__count text-faint">{{ deck.totalWords }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStatsStore }  from '@/stores/stats.store'
import { useStreakStore }  from '@/stores/streak.store'
import { useWordsStore }  from '@/stores/words.store'
import { useDecksStore }  from '@/stores/decks.store'
import { useI18n }        from '@/composables/useI18n'
import StreakBadge    from '@/components/shared/StreakBadge.vue'
import Heatmap        from '@/components/stats/Heatmap.vue'
import RetentionChart from '@/components/stats/RetentionChart.vue'
import DeckProgress   from '@/components/decks/DeckProgress.vue'

const statsStore  = useStatsStore()
const streakStore = useStreakStore()
const wordsStore  = useWordsStore()
const decksStore  = useDecksStore()
const { t }       = useI18n()

onMounted(async () => {
  await statsStore.loadStats()
})

const retentionSeries = computed(() =>
  statsStore.dailyStats.map(d => ({
    date:    d.date,
    correct: d.studied ? Math.round(d.correct / d.studied * 100) : 0,
  }))
)
</script>

<style scoped>
.stats-view { padding: var(--space-8); max-width: 860px; width: 100%; display: flex; flex-direction: column; gap: var(--space-8); }
.page-header { display: flex; align-items: center; justify-content: space-between; }
.page-title  { font-size: var(--text-2xl); letter-spacing: -0.02em; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.stat-card__value {
  font-size: var(--text-2xl);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  line-height: 1;
  font-family: var(--font-mono);
}

.stat-card__label { font-size: var(--text-xs); color: var(--color-text-faint); }

.stats-section { display: flex; flex-direction: column; gap: var(--space-4); }
.section-title { font-size: var(--text-lg); font-weight: var(--weight-medium); }

.chart-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  overflow: hidden;
}

.deck-breakdown {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.breakdown-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border-muted);
}
.breakdown-row:last-child { border-bottom: none; }

.breakdown-row__name {
  font-size: var(--text-sm);
  color: var(--color-text);
  min-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.breakdown-row__count {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  min-width: 40px;
  text-align: right;
}
</style>