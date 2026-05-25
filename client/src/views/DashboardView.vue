<template>
  <div class="dashboard">
    <header class="dashboard__header">
      <div>
        <p class="dashboard__greeting text-muted">{{ greeting }}</p>
        <h1 class="dashboard__title">
          {{ todayGoalMet ? 'Goal met today' : 'Ready to study?' }}
        </h1>
      </div>

      <div class="xp-pill">
        <i class="ti ti-bolt" aria-hidden="true" />
        <span>{{ todayXP }} XP today</span>
      </div>
    </header>

    <section class="dashboard__row" aria-label="Daily progress">

      <div class="info-card info-card--streak">
        <div class="info-card__icon" :class="{ 'flame-pulse': streakStatus === 'active' }">
          <i class="ti ti-flame" aria-hidden="true" />
        </div>
        <div class="info-card__body">
          <span class="info-card__value">{{ currentStreak }}</span>
          <span class="info-card__label">day streak</span>
        </div>
        <span
          class="streak-status"
          :class="`streak-status--${streakStatus}`"
        >{{ streakStatusLabel }}</span>
      </div>

      <div class="info-card info-card--goal">
        <div class="info-card__icon">
          <i class="ti ti-target" aria-hidden="true" />
        </div>
        <div class="info-card__body">
          <span class="info-card__value">{{ todayProgressPercent }}%</span>
          <span class="info-card__label">daily goal</span>
        </div>
        <div class="goal-bar">
          <div class="goal-bar__fill" :style="{ width: todayProgressPercent + '%' }" />
        </div>
      </div>

      <div class="info-card">
        <div class="info-card__icon">
          <i class="ti ti-award" aria-hidden="true" />
        </div>
        <div class="info-card__body">
          <span class="info-card__value">{{ totalXP.toLocaleString() }}</span>
          <span class="info-card__label">total XP</span>
        </div>
      </div>

      <div class="info-card">
        <div class="info-card__icon">
          <i class="ti ti-circle-check" aria-hidden="true" />
        </div>
        <div class="info-card__body">
          <span class="info-card__value">{{ wordsStore.knownCount }}</span>
          <span class="info-card__label">words known</span>
        </div>
      </div>

    </section>

    <section v-if="totalDue > 0" class="due-banner" aria-label="Cards due for review">
      <div class="due-banner__left">
        <i class="ti ti-clock" aria-hidden="true" />
        <div>
          <p class="due-banner__count">{{ totalDue }} cards due for review</p>
          <p class="due-banner__sub text-muted">Across {{ decksWithDue.length }} deck{{ decksWithDue.length !== 1 ? 's' : '' }}</p>
        </div>
      </div>
      <RouterLink
        :to="{ name: 'study', params: { deckId: decksWithDue[0]?.id } }"
        class="btn btn--primary"
        v-if="decksWithDue[0]"
      >
        <i class="ti ti-player-play" aria-hidden="true" />
        Start studying
      </RouterLink>
    </section>

    <section class="dashboard__section" aria-label="Your decks">
      <div class="section-header">
        <h2 class="section-title">Decks</h2>
        <RouterLink :to="{ name: 'decks' }" class="section-link">
          View all <i class="ti ti-arrow-right" aria-hidden="true" />
        </RouterLink>
      </div>

      <div class="deck-grid" v-if="deckProgress.length">
        <DeckCard
          v-for="deck in deckProgress.slice(0, 4)"
          :key="deck.id"
          :deck="deck"
          @study="goStudy"
        />
      </div>

      <div class="empty-state" v-else>
        <i class="ti ti-stack-2 empty-state__icon" aria-hidden="true" />
        <p>No decks yet.</p>
        <RouterLink :to="{ name: 'decks' }" class="btn btn--ghost" style="margin-top: var(--space-3)">
          Create your first deck
        </RouterLink>
      </div>

    </section>

    <section class="dashboard__section" aria-label="Quick actions">
      <h2 class="section-title">Explore</h2>
      <div class="quick-actions">
        <RouterLink :to="{ name: 'immersion' }" class="quick-action">
          <i class="ti ti-eye" aria-hidden="true" />
          <span>Immersion</span>
          <p class="text-muted">Read, listen, absorb</p>
        </RouterLink>
        <RouterLink :to="{ name: 'vocab' }" class="quick-action">
          <i class="ti ti-book-2" aria-hidden="true" />
          <span>Vocabulary</span>
          <p class="text-muted">Browse all words</p>
        </RouterLink>
        <RouterLink :to="{ name: 'stats' }" class="quick-action">
          <i class="ti ti-chart-line" aria-hidden="true" />
          <span>Statistics</span>
          <p class="text-muted">Track your progress</p>
        </RouterLink>
      </div>
    </section>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useStreakStore } from '@/stores/streak.store'
import { useWordsStore  } from '@/stores/words.store'
import { useDecksStore  } from '@/stores/decks.store'
import DeckCard from '@/components/decks/DeckCard.vue'

const router      = useRouter()
const streakStore = useStreakStore()
const wordsStore  = useWordsStore()
const decksStore  = useDecksStore()

const currentStreak      = computed(() => streakStore.currentStreak)
const streakStatus       = computed(() => streakStore.streakStatus)
const todayXP            = computed(() => streakStore.todayXP)
const totalXP            = computed(() => streakStore.totalXP)
const todayGoalMet       = computed(() => streakStore.todayGoalMet)
const todayProgressPercent = computed(() => streakStore.todayProgressPercent)

const streakStatusLabel = computed(() => ({
  active:   'On track',
  'at-risk': 'Study today!',
  broken:   'Start fresh',
}[streakStatus.value] ?? ''))

const deckProgress  = computed(() => decksStore.deckProgress)
const decksWithDue  = computed(() => deckProgress.value.filter(d => d.dueCount > 0))
const totalDue      = computed(() => decksWithDue.value.reduce((s, d) => s + d.dueCount, 0))

const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
})

function goStudy(deckId) {
  router.push({ name: 'study', params: { deckId } })
}
</script>

<style scoped>
.dashboard {
  padding: var(--space-8) var(--space-8);
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.dashboard__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
}

.dashboard__greeting {
  font-size: var(--text-sm);
  margin-bottom: var(--space-1);
}

.dashboard__title {
  font-size: var(--text-2xl);
  letter-spacing: -0.02em;
}

.xp-pill {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-accent);
  background: var(--color-accent-faint);
  border: 1px solid rgba(201,168,76,0.2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  flex-shrink: 0;
}
.xp-pill .ti { font-size: 14px; }

.dashboard__row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

.info-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.info-card__icon {
  font-size: 22px;
  color: var(--color-text-faint);
  display: inline-flex;
}

.info-card--streak .info-card__icon { color: var(--color-accent); }
.info-card--goal   .info-card__icon { color: var(--color-success); }

.info-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-card__value {
  font-size: var(--text-xl);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  line-height: 1;
}

.info-card__label {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.streak-status {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  align-self: flex-start;
}
.streak-status--active   { background: rgba(39,174,96,0.12);   color: var(--color-success); }
.streak-status--at-risk  { background: rgba(230,126,34,0.12);  color: #e67e22; }
.streak-status--broken   { background: var(--color-surface-2); color: var(--color-text-faint); }

.goal-bar {
  height: 3px;
  background: var(--color-surface-3);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: var(--space-1);
}
.goal-bar__fill {
  height: 100%;
  background: var(--color-success);
  border-radius: var(--radius-full);
  transition: width 600ms cubic-bezier(0.22, 1, 0.36, 1);
}

.due-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  border-radius: var(--radius-xl);
  background: var(--color-accent-faint);
  border: 1px solid rgba(201,168,76,0.2);
}

.due-banner__left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-width: 0;
}

.due-banner__left .ti {
  font-size: 24px;
  color: var(--color-accent);
  flex-shrink: 0;
}

.due-banner__count {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.due-banner__sub { font-size: var(--text-xs); margin-top: 2px; }

.dashboard__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-medium);
}

.section-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  text-decoration: none;
  transition: color 140ms;
}
.section-link:hover { color: var(--color-accent); }
.section-link .ti { font-size: 13px; }

.deck-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-4);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.quick-action {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  text-decoration: none;
  transition: border-color 160ms, background 160ms, transform 160ms;
}

.quick-action:hover {
  border-color: var(--color-border-strong);
  background: var(--color-surface-2);
  transform: translateY(-1px);
}

.quick-action .ti {
  font-size: 22px;
  color: var(--color-text-faint);
}

.quick-action span {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.quick-action p {
  font-size: var(--text-xs);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-10) var(--space-6);
  text-align: center;
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-xl);
  color: var(--color-text-faint);
}

.empty-state__icon { font-size: 32px; margin-bottom: var(--space-2); }

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  transition: background 140ms, transform 80ms;
  flex-shrink: 0;
}
.btn:hover { transform: translateY(-1px); }

.btn--primary {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border-color: var(--color-accent);
}
.btn--primary:hover { background: var(--color-accent-hover); }

.btn--ghost {
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  border-color: var(--color-border-strong);
}
.btn--ghost:hover { background: var(--color-surface-3); }
</style>