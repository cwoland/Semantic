<template>
  <RouterLink
    :to="{ name: 'deck-detail', params: { id: deck.id } }"
    class="deck-card"
  >
    <div class="deck-card__header">
      <span class="deck-card__lang">{{ deck.language?.toUpperCase() || '??' }}</span>
      <span v-if="deck.dueCount > 0" class="deck-card__due">{{ deck.dueCount }}</span>
    </div>

    <h3 class="deck-card__name">{{ deck.name }}</h3>

    <p class="deck-card__desc text-muted" v-if="deck.description">
      {{ deck.description }}
    </p>

    <div class="deck-card__progress-wrap" v-if="deck.totalWords">
      <div class="deck-card__bar">
        <div class="deck-card__fill" :style="{ width: deck.progress + '%' }" />
      </div>
      <span class="deck-card__pct">{{ deck.progress }}%</span>
    </div>

    <div class="deck-card__stats">
      <span class="deck-stat">
        <i class="ti ti-cards" aria-hidden="true" />
        {{ deck.totalWords }} words
      </span>
      <span class="deck-stat deck-stat--known" v-if="deck.knownCount">
        <i class="ti ti-circle-check" aria-hidden="true" />
        {{ deck.knownCount }} known
      </span>
      <span class="deck-stat deck-stat--faint" v-if="!deck.totalWords">
        No words yet
      </span>
    </div>

    <button
      v-if="deck.dueCount > 0"
      class="deck-card__cta"
      @click.prevent="$emit('study', deck.id)"
    >
      <i class="ti ti-player-play" aria-hidden="true" />
      Study {{ deck.dueCount }} due
    </button>

  </RouterLink>
</template>

<script setup>
defineProps({ deck: { type: Object, required: true } })
defineEmits(['study'])
</script>

<style scoped>
.deck-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  text-decoration: none;
  transition: border-color 160ms, background 160ms, transform 160ms;
  position: relative;
  overflow: hidden;
}

.deck-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.deck-card:hover {
  border-color: var(--color-border-strong);
  background: var(--color-surface-2);
  transform: translateY(-2px);
}
.deck-card:hover::before { transform: scaleX(1); }

.deck-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.deck-card__lang {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--color-accent);
  letter-spacing: 0.1em;
}

.deck-card__due {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  font-weight: var(--weight-medium);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--color-accent-faint);
  color: var(--color-accent);
  border: 1px solid rgba(201,168,76,0.2);
}

.deck-card__name {
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.deck-card__desc {
  font-size: var(--text-xs);
  line-height: var(--leading-snug);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.deck-card__progress-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.deck-card__bar {
  flex: 1;
  height: 3px;
  background: var(--color-surface-3);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.deck-card__fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width 600ms cubic-bezier(0.22, 1, 0.36, 1);
}

.deck-card__pct {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--color-text-faint);
  min-width: 28px;
  text-align: right;
}

.deck-card__stats {
  display: flex;
  gap: var(--space-4);
}

.deck-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}
.deck-stat .ti { font-size: 11px; }
.deck-stat--known { color: var(--color-success); }
.deck-stat--faint { font-style: italic; }

.deck-card__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--color-accent);
  background: var(--color-accent-faint);
  border: 1px solid rgba(201,168,76,0.15);
  cursor: pointer;
  transition: background 140ms, border-color 140ms;
  align-self: flex-start;
}
.deck-card__cta:hover {
  background: rgba(201,168,76,0.18);
  border-color: rgba(201,168,76,0.3);
}
.deck-card__cta .ti { font-size: 11px; }
</style>