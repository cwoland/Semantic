<template>
  <div class="deck-progress">
    <div class="deck-progress__bars">
      <div
        v-for="seg in segments"
        :key="seg.status"
        class="deck-progress__seg"
        :class="`deck-progress__seg--${seg.status}`"
        :style="{ width: seg.pct + '%' }"
        :title="`${seg.label}: ${seg.count}`"
      />
    </div>
    <div class="deck-progress__legend">
      <span v-for="seg in segments" :key="seg.status" class="legend-item">
        <span class="legend-item__dot" :class="`legend-item__dot--${seg.status}`" />
        {{ seg.label }}
        <span class="legend-item__count">{{ seg.count }}</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  words: { type: Array, required: true },
})

const segments = computed(() => {
  const total = props.words.length || 1
  const counts = {
    new:      props.words.filter(w => w.status === 'new').length,
    learning: props.words.filter(w => w.status === 'learning').length,
    review:   props.words.filter(w => w.status === 'review').length,
    known:    props.words.filter(w => w.status === 'known').length,
  }
  return [
    { status: 'new',      label: 'New',      count: counts.new,      pct: counts.new      / total * 100 },
    { status: 'learning', label: 'Learning', count: counts.learning, pct: counts.learning / total * 100 },
    { status: 'review',   label: 'Review',   count: counts.review,   pct: counts.review   / total * 100 },
    { status: 'known',    label: 'Known',    count: counts.known,    pct: counts.known    / total * 100 },
  ].filter(s => s.count > 0)
})
</script>

<style scoped>
.deck-progress { display: flex; flex-direction: column; gap: var(--space-3); }

.deck-progress__bars {
  display: flex;
  height: 6px;
  border-radius: var(--radius-full);
  overflow: hidden;
  background: var(--color-surface-3);
  gap: 1px;
}

.deck-progress__seg { height: 100%; transition: width 600ms cubic-bezier(0.22, 1, 0.36, 1); }
.deck-progress__seg--new      { background: var(--color-text-faint); }
.deck-progress__seg--learning { background: var(--color-hard); }
.deck-progress__seg--review   { background: var(--color-accent); }
.deck-progress__seg--known    { background: var(--color-good); }

.deck-progress__legend {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.legend-item__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.legend-item__dot--new      { background: var(--color-text-faint); }
.legend-item__dot--learning { background: var(--color-hard); }
.legend-item__dot--review   { background: var(--color-accent); }
.legend-item__dot--known    { background: var(--color-good); }

.legend-item__count {
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}
</style>