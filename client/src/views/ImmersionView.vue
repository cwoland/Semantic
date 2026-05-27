<template>
  <div class="immersion-view">
    <header class="page-header">
      <h1 class="page-title">{{ t.immersion_title }}</h1>
      <div class="page-header__actions">
        <div class="timer" v-if="immersionStore.isActive">
          <i class="ti ti-clock" />
          {{ immersionStore.timerFormatted }}
        </div>
        <button
          v-if="immersionStore.hasPendingWords"
          class="btn btn--primary"
          @click="showSaveModal = true"
        >
          <i class="ti ti-bookmark" />
          {{ t.immersion_save }} {{ immersionStore.pendingWords.length }} words
        </button>
      </div>
    </header>

    <div class="mode-tabs">
      <button
        v-for="m in modes"
        :key="m.value"
        class="mode-tab"
        :class="{ 'mode-tab--active': activeMode === m.value }"
        @click="switchMode(m.value)"
      >
        <i :class="['ti', m.icon]" />
        {{ m.label }}
      </button>
    </div>

    <div class="immersion-view__panel">
      <Reader       v-if="activeMode === 'reader'" />
      <LyricsPanel  v-if="activeMode === 'music'"  />
      <div v-if="activeMode === 'movie'" class="coming-soon">
        <i class="ti ti-movie text-faint" style="font-size:32px" />
        <p class="text-muted">{{ t.immersion_movie_soon }}</p>
      </div>
    </div>

    <Modal v-model="showSaveModal" :title="t.immersion_save_words">
      <div class="save-modal__body">
        <p class="text-muted" style="font-size: var(--text-sm); margin-bottom: var(--space-4)">
          {{ t.immersion_choose_deck }} {{ immersionStore.pendingWords.length }} words to:
        </p>
        <div class="deck-options">
          <button
            v-for="deck in decksStore.decks"
            :key="deck.id"
            class="deck-option"
            @click="saveToDeck(deck.id)"
          >
            <span class="deck-option__lang">{{ deck.language?.toUpperCase() }}</span>
            {{ deck.name }}
          </button>
        </div>
      </div>
    </Modal>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ref, computed } from 'vue'
import { useImmersionStore } from '@/stores/immersion.store'
import { useWordsStore }     from '@/stores/words.store'
import { useDecksStore }     from '@/stores/decks.store'
import { useToast }          from '@/composables/useToast'
import { useI18n }           from '@/composables/useI18n'

import Reader      from '@/components/immersion/Reader.vue'
import LyricsPanel from '@/components/immersion/LyricsPanel.vue'
import Modal       from '@/components/shared/Modal.vue'

const immersionStore = useImmersionStore()
const wordsStore     = useWordsStore()
const decksStore     = useDecksStore()
const toast          = useToast()
const { t }          = useI18n()

const activeMode   = ref('reader')
const showSaveModal = ref(false)

const modes = computed(() => [
  { value: 'reader', label: t.immersion_reader,  icon: 'ti-book-2' },
  { value: 'music',  label: t.immersion_music,   icon: 'ti-music'  },
  { value: 'movie',  label: t.immersion_movie,   icon: 'ti-movie'  },
])
]

function switchMode(mode) {
  activeMode.value = mode
  immersionStore.startImmersion(mode)
}

async function saveToDeck(deckId) {
  const saved = await immersionStore.savePendingToDecks(deckId, wordsStore)
  showSaveModal.value = false
  toast.success(`${saved.length} words saved to deck`)
}
</script>

<style scoped>
.immersion-view { padding: var(--space-8); max-width: 860px; width: 100%; display: flex; flex-direction: column; gap: var(--space-6); }

.page-header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); }
.page-title  { font-size: var(--text-2xl); letter-spacing: -0.02em; }
.page-header__actions { display: flex; align-items: center; gap: var(--space-3); }

.timer {
  display: flex; align-items: center; gap: var(--space-2);
  font-size: var(--text-sm); font-family: var(--font-mono);
  color: var(--color-text-faint);
}

.mode-tabs {
  display: flex;
  gap: 2px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 3px;
  align-self: flex-start;
}

.mode-tab {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  background: none; border: none; cursor: pointer;
  color: var(--color-text-faint);
  transition: background 140ms, color 140ms;
}
.mode-tab:hover { color: var(--color-text-muted); }
.mode-tab--active { background: var(--color-surface-2); color: var(--color-text); }
.mode-tab .ti { font-size: 15px; }

.immersion-view__panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  min-height: 400px;
}

.coming-soon {
  display: flex; flex-direction: column; align-items: center;
  gap: var(--space-4); padding: var(--space-16); text-align: center;
}

.save-modal__body { display: flex; flex-direction: column; gap: var(--space-3); }

.deck-options { display: flex; flex-direction: column; gap: var(--space-2); }

.deck-option {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm); color: var(--color-text);
  cursor: pointer; text-align: left;
  transition: border-color 140ms, background 140ms;
}
.deck-option:hover { border-color: var(--color-accent); background: var(--color-accent-faint); }

.deck-option__lang {
  font-size: var(--text-xs); font-family: var(--font-mono);
  color: var(--color-accent); letter-spacing: 0.1em;
}

.btn {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md); font-size: var(--text-sm);
  font-weight: var(--weight-medium); border: none; cursor: pointer;
}
.btn--primary { background: var(--color-accent); color: var(--color-text-inverse); }
.btn--primary:hover { background: var(--color-accent-hover); }
</style>