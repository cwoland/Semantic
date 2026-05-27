<template>
  <div
    class="card-flip-scene"
    :class="{ 'is-interactive': !isFlipped }"
    @click="onCardClick"
    role="button"
    :aria-label="isFlipped ? 'Answer revealed' : 'Click or press Space to reveal answer'"
    tabindex="0"
    @keydown.space.prevent="onCardClick"
    @keydown.enter.prevent="onCardClick"
  >
    <div class="card-flip-inner" :class="{ 'is-flipped': isFlipped }">

      <div class="card-face card-face--front">
        <div class="card-face__body">

          <div class="card__source" v-if="card.sourceType && card.sourceType !== 'manual'">
            <i :class="['ti', sourceIcon]" aria-hidden="true" />
            <span>{{ sourceLabel }}</span>
          </div>

          <p class="word-display">{{ card.word }}</p>

          <span class="card__lang">{{ card.language?.toUpperCase() }}</span>

          <p class="card__hint">
            {{ t.study_reveal }}
          </p>

        </div>
      </div>

      <div class="card-face card-face--back">
        <div class="card-face__body">

          <div class="card__source" v-if="card.sourceType && card.sourceType !== 'manual'">
            <i :class="['ti', sourceIcon]" aria-hidden="true" />
            <span>{{ sourceLabel }}</span>
          </div>

          <p class="card__word-echo">{{ card.word }}</p>

          <p class="word-display">{{ card.translation }}</p>

          <p class="word-example" v-if="card.example">"{{ card.example }}"</p>

          <p class="card__notes" v-if="card.notes">{{ card.notes }}</p>

          <div class="card__tags" v-if="card.tags?.length">
            <span v-for="tag in card.tags" :key="tag" class="card__tag">{{ tag }}</span>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const props = defineProps({
  card:      { type: Object,  required: true },
  isFlipped: { type: Boolean, default: false },
})

const emit = defineEmits(['reveal'])

function onCardClick() {
  if (!props.isFlipped) emit('reveal')
}

const sourceIcon = computed(() => ({
  music:  'ti-music',
  movie:  'ti-movie',
  reader: 'ti-book-2',
}[props.card.sourceType] ?? 'ti-pencil'))

const sourceLabel = computed(() => ({
  music:  props.card.sourceRef?.track ?? t.immersion_music,
  movie:  props.card.sourceRef?.title ?? t.immersion_movie,
  reader: t.immersion_reader,
}[props.card.sourceType] ?? t.vocab_manual))
</script>

<style scoped>
.card-flip-scene {
  perspective: 1200px;
  width: 100%;
  max-width: 600px;
  height: 340px;
  outline: none;
}

.card-flip-scene.is-interactive { cursor: pointer; }

.card-flip-scene:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 6px;
  border-radius: var(--radius-xl);
}

.card-flip-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 520ms cubic-bezier(0.4, 0, 0.2, 1);
}

.card-flip-inner.is-flipped { transform: rotateY(180deg); }

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  overflow: hidden;
}

.card-face--front { background: var(--color-surface); }

.card-face--back {
  background: var(--color-surface-2);
  transform: rotateY(180deg);
}

.card-face::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  opacity: 0.4;
}

.card-face__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  text-align: center;
}

.card__source {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--color-accent);
  letter-spacing: 0.06em;
}
.card__source .ti { font-size: 12px; }

.card__lang {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--color-text-faint);
  letter-spacing: 0.12em;
  border: 1px solid var(--color-border);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
}

.card__hint {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  margin-top: var(--space-1);
}

.card__word-echo {
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  letter-spacing: 0.04em;
}

.card__notes {
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  max-width: 420px;
  line-height: var(--leading-normal);
}

.card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  justify-content: center;
}

.card__tag {
  font-size: var(--text-xs);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  color: var(--color-text-faint);
  font-family: var(--font-mono);
}
</style>