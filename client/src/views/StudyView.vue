<template>
  <div class="study-view">

    <header class="study-view__header" v-if="phase !== 'done'">

      <RouterLink :to="{ name: 'decks' }" class="header-btn" aria-label="Exit session">
        <i class="ti ti-x" aria-hidden="true" />
      </RouterLink>

      <span class="header__deck">{{ activeDeck?.name }}</span>

      <div class="header__progress">
        <div
          class="progress-bar"
          role="progressbar"
          :aria-valuenow="studyStore.progress.percent"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div class="progress-bar__fill" :style="{ width: studyStore.progress.percent + '%' }" />
        </div>
        <span class="progress-count text-faint">
          {{ studyStore.progress.current }} / {{ studyStore.progress.total }}
        </span>
      </div>

    </header>

    <div class="study-view__body">

      <Transition name="fade">
        <div v-if="phase === 'idle'" class="study-view__center">
          <div class="loading-spinner" aria-label="Loading session..." />
        </div>
      </Transition>

      <Transition name="fade">
        <div v-if="phase === 'empty'" class="study-view__center">
          <i class="ti ti-circle-check state-icon state-icon--good" aria-hidden="true" />
          <h2>{{ t.study_caught_up }}</h2>
          <p class="text-muted">{{ t.study_no_due }}</p>
          <RouterLink :to="{ name: 'decks' }" class="btn btn--ghost" style="margin-top: var(--space-4)">
            {{ t.study_back }}
          </RouterLink>
        </div>
      </Transition>

      <Transition name="fade">
        <div
          v-if="phase === 'question' || phase === 'answer'"
          class="study-view__session"
        >

          <FlashCard
            v-if="currentCard"
            :card="currentCard"
            :is-flipped="phase === 'answer'"
            @reveal="studyStore.revealAnswer()"
          />

          <Transition name="slide-up">
            <RatingBar
              v-if="phase === 'answer'"
              :card="currentCard"
              @rate="handleRate"
            />
          </Transition>

          <div class="study-view__shortcuts" v-if="phase === 'question'">
            <span class="text-faint" style="font-size: var(--text-xs);">
              <kbd>Space</kbd> {{ t.study_reveal }} &nbsp;·&nbsp; <kbd>Esc</kbd> exit
            </span>
          </div>

          <div class="study-view__shortcuts" v-if="phase === 'answer'">
            <span class="text-faint" style="font-size: var(--text-xs);">
              <kbd>1</kbd> {{ t.study_again }} &nbsp;·&nbsp; <kbd>2</kbd> {{ t.study_hard }} &nbsp;·&nbsp;
              <kbd>3</kbd> {{ t.study_good }} &nbsp;·&nbsp; <kbd>4</kbd> {{ t.study_easy }}
            </span>
          </div>

        </div>
      </Transition>

      <Transition name="fade">
        <div v-if="phase === 'done'" class="study-view__center">
          <SessionStats
            :progress="studyStore.progress"
            :deck-name="activeDeck?.name"
            @study-again="restartSession"
          />
        </div>
      </Transition>

    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

import { useStudyStore } from '@/stores/study.store'
import { useDecksStore } from '@/stores/decks.store'
import { useToast }      from '@/composables/useToast'
import { useI18n }       from '@/composables/useI18n'

import FlashCard      from '@/components/study/FlashCard.vue'
import RatingBar      from '@/components/study/RatingBar.vue'
import SessionStats from '@/components/study/SessionStats.vue'

const route      = useRoute()
const studyStore = useStudyStore()
const decksStore = useDecksStore()
const toast      = useToast()
const { t }      = useI18n()

const deckId     = computed(() => Number(route.params.deckId))
const activeDeck = computed(() => decksStore.deckById(deckId.value))
const currentCard = computed(() => studyStore.currentCard)
const phase       = computed(() => studyStore.phase)

onMounted(async () => {
  try {
    const started = await studyStore.startSession(deckId.value)
    if (!started) {
      studyStore.phase = 'empty'
    }
  } catch (e) {
    console.error('startSession error:', e)
    studyStore.phase = 'empty'
  }
})

onUnmounted(() => {
  if (studyStore.phase === 'done' || studyStore.phase === 'empty') {
    studyStore.resetSession()
  }
})

async function handleRate(quality) {
  try {
    await studyStore.submitAnswer(quality)

    const { correct } = studyStore.progress
    if (correct > 0 && correct % 10 === 0) {
      toast.success(`${correct} correct answers this session 🔥`)
    }
  } catch (e) {
    console.error('submitAnswer error:', e)
    toast.error('Failed to submit answer')
  }
}

async function restartSession() {
  try {
    studyStore.resetSession()
    await studyStore.startSession(deckId.value)
  } catch (e) {
    console.error('restartSession error:', e)
    toast.error('Failed to restart session')
    studyStore.phase = 'empty'
  }
}

function onKeydown(e) {
  const tag = document.activeElement?.tagName
  if (['INPUT', 'TEXTAREA'].includes(tag)) return

  if (phase.value === 'question' && e.key === ' ') {
    e.preventDefault()
    studyStore.revealAnswer()
    return
  }

  if (phase.value === 'answer') {
    const map = { '1': 1, '2': 2, '3': 4, '4': 5 }
    const quality = map[e.key]
    if (quality !== undefined) {
      e.preventDefault()
      handleRate(quality)
    }
  }
}

onMounted(()  => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.study-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background: var(--color-bg);
}

.study-view__header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  flex-shrink: 0;
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: var(--color-text-faint);
  transition: color 140ms ease, background 140ms ease;
  text-decoration: none;
  flex-shrink: 0;
}

.header-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-2);
}

.header-btn .ti { font-size: 18px; }

.header__deck {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.header__progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.progress-bar {
  flex: 1;
  height: 3px;
  background: var(--color-surface-3);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width 400ms cubic-bezier(0.22, 1, 0.36, 1);
}

.progress-count {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  flex-shrink: 0;
  min-width: 48px;
  text-align: right;
}

.study-view__body {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.study-view__center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
  padding: var(--space-8);
}

.study-view__session {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
  width: 100%;
  max-width: 700px;
  padding: var(--space-8) var(--space-6);
  position: relative;
  z-index: 1;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}

.rating-bar {
  position: relative;
  z-index: 10;
}

.study-view__shortcuts {
  text-align: center;
}

.state-icon {
  font-size: 48px;
}

.state-icon--good { color: var(--color-good); }

.loading-spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--color-border-strong);
  border-top-color: var(--color-accent);
  animation: spin 600ms linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  text-decoration: none;
  transition: background 140ms ease, transform 80ms ease;
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

@media (max-width: 768px) {
  .study-view__session {
    padding: var(--space-4) var(--space-3);
    gap: var(--space-5);
  }

  .card-flip-scene {
    height: 260px;
  }

  .rating-bar {
    gap: var(--space-2);
    width: 100%;
    justify-content: stretch;
  }

  .rating-btn {
    flex: 1;
    min-width: unset;
    padding: var(--space-3) var(--space-2);
  }

  .study-view__shortcuts {
    display: none;
  }
}
</style>