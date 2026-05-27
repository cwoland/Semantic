<template>
  <div class="deck-detail" v-if="deck">
    <header class="deck-header">
      <div class="deck-header__top">
        <RouterLink :to="{ name: 'decks' }" class="back-link">
          <i class="ti ti-arrow-left" aria-hidden="true" />
          Decks
        </RouterLink>

        <div class="deck-header__actions">
          <button class="icon-btn" @click="showEditForm = true" title="Edit deck">
            <i class="ti ti-pencil" aria-hidden="true" />
          </button>
          <button class="icon-btn icon-btn--danger" @click="confirmDelete" title="Delete deck">
            <i class="ti ti-trash" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="deck-header__body">
        <div>
          <span class="deck-header__lang">{{ deck.language?.toUpperCase() }}</span>
          <h1 class="deck-header__name">{{ deck.name }}</h1>
          <p class="text-muted" v-if="deck.description" style="font-size: var(--text-sm); margin-top: var(--space-1)">
            {{ deck.description }}
          </p>
        </div>

        <button
          class="btn btn--primary"
          @click="goStudy"
          :disabled="!deckStats.dueCount"
        >
          <i class="ti ti-player-play" aria-hidden="true" />
          {{ deckStats.dueCount ? `Study ${deckStats.dueCount} due` : 'All caught up' }}
        </button>
      </div>

      <div class="deck-stats">
        <div class="deck-stat-item" v-for="s in statItems" :key="s.label">
          <span class="deck-stat-item__value" :style="{ color: s.color }">{{ s.value }}</span>
          <span class="deck-stat-item__label">{{ s.label }}</span>
        </div>
        <div class="deck-stat-item deck-stat-item--bar">
          <div class="progress-bar">
            <div class="progress-bar__fill" :style="{ width: deckStats.progress + '%' }" />
          </div>
          <span class="deck-stat-item__label">{{ deckStats.progress }}% known</span>
        </div>
      </div>
    </header>

    <div class="words-toolbar">

      <div class="filter-tabs" role="tablist">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ 'filter-tab--active': activeFilter === tab.value }"
          role="tab"
          :aria-selected="activeFilter === tab.value"
          @click="activeFilter = tab.value"
        >
          {{ tab.label }}
          <span class="filter-tab__count">{{ tab.count }}</span>
        </button>
      </div>

      <div class="search-box">
        <i class="ti ti-search" aria-hidden="true" />
        <input
          v-model="searchQuery"
          class="search-input"
          placeholder="Search words…"
          aria-label="Search words"
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''" aria-label="Clear search">
          <i class="ti ti-x" />
        </button>
      </div>

      <button class="btn btn--ghost" @click="showAddWord = true">
        <i class="ti ti-plus" aria-hidden="true" />
        Add word
      </button>

    </div>

    <div class="word-list" v-if="filteredWords.length">
      <div
        v-for="word in filteredWords"
        :key="word.id"
        class="word-row"
      >
        <span
          class="word-row__status"
          :class="`word-row__status--${word.status}`"
          :title="word.status"
          aria-label="Status: {{ word.status }}"
        />

        <div class="word-row__content">
          <span class="word-row__word">{{ word.word }}</span>
          <span class="word-row__translation text-muted">{{ word.translation }}</span>
        </div>

        <span class="word-row__source" v-if="word.sourceType !== 'manual'">
          <i :class="['ti', sourceIcon(word.sourceType)]" aria-hidden="true" />
        </span>

        <span class="word-row__interval text-faint">
          {{ intervalLabel(word) }}
        </span>

        <button
          class="word-row__delete"
          @click="deleteWord(word.id)"
          aria-label="Delete word"
        >
          <i class="ti ti-trash" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div class="empty-state" v-else-if="!deckWords.length">
      <i class="ti ti-cards empty-state__icon" aria-hidden="true" />
      <h2>No words in this deck</h2>
      <p class="text-muted">Add your first word to start building vocabulary.</p>
      <button class="btn btn--primary" @click="showAddWord = true" style="margin-top: var(--space-4)">
        <i class="ti ti-plus" />
        Add first word
      </button>
    </div>

    <div class="empty-state" v-else>
      <p class="text-muted">No words match "{{ searchQuery }}"</p>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showAddWord" class="word-form-backdrop" @click.self="showAddWord = false">
          <div class="word-form" role="dialog" aria-label="Add word">

            <div class="word-form__header">
              <h2>Add word</h2>
              <button class="icon-btn" @click="showAddWord = false">
                <i class="ti ti-x" />
              </button>
            </div>

            <div class="word-form__body">
              <label class="form-field">
                <span class="form-field__label">Word</span>
                <input v-model="newWord.word" class="form-input" placeholder="e.g. serendipity" autofocus @keydown.enter="submitWord" />
              </label>
              <label class="form-field">
                <span class="form-field__label">Translation</span>
                <input v-model="newWord.translation" class="form-input" placeholder="Translation or definition" @keydown.enter="submitWord" />
              </label>
              <label class="form-field">
                <span class="form-field__label">Example <span style="color: var(--color-text-faint); font-size: var(--text-xs)">(optional)</span></span>
                <input v-model="newWord.example" class="form-input" placeholder="Example sentence" @keydown.enter="submitWord" />
              </label>
              <label class="form-field">
                <span class="form-field__label">Notes <span style="color: var(--color-text-faint); font-size: var(--text-xs)">(optional)</span></span>
                <input v-model="newWord.notes" class="form-input" placeholder="Grammar notes, mnemonics…" @keydown.enter="submitWord" />
              </label>
            </div>

            <div class="word-form__footer">
              <button class="btn btn--ghost" @click="showAddWord = false">Cancel</button>
              <button class="btn btn--primary" @click="submitWord" :disabled="!newWord.word.trim()">
                Add word
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <DeckForm
          v-if="showEditForm"
          :initial="deck"
          @close="showEditForm = false"
          @submit="updateDeck"
        />
      </Transition>
    </Teleport>

  </div>

  <div class="empty-state" v-else style="padding: var(--space-16)">
    <i class="ti ti-mood-sad empty-state__icon" />
    <h2>Deck not found</h2>
    <RouterLink :to="{ name: 'decks' }" class="btn btn--ghost" style="margin-top: var(--space-4)">
      Back to decks
    </RouterLink>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDecksStore } from '@/stores/decks.store'
import { useWordsStore } from '@/stores/words.store'
import { useToast }      from '@/composables/useToast'
import { daysUntilReview } from '@/utils/sm2'
import DeckForm from '@/components/decks/DeckForm.vue'

const route      = useRoute()
const router     = useRouter()
const decksStore = useDecksStore()
const wordsStore = useWordsStore()
const toast      = useToast()

const deckId = computed(() => Number(route.params.id))
const deck   = computed(() => decksStore.deckById(deckId.value))

const deckStats = computed(() =>
  decksStore.deckProgress.find(d => d.id === deckId.value) ?? { dueCount: 0, progress: 0 }
)

const deckWords   = computed(() => wordsStore.getWordsByDeck(deckId.value))
const activeFilter = ref('all')
const searchQuery  = ref('')

const filterTabs = computed(() => [
  { value: 'all',      label: 'All',      count: deckWords.value.length },
  { value: 'new',      label: 'New',      count: deckWords.value.filter(w => w.status === 'new').length },
  { value: 'learning', label: 'Learning', count: deckWords.value.filter(w => w.status === 'learning').length },
  { value: 'review',   label: 'Review',   count: deckWords.value.filter(w => w.status === 'review').length },
  { value: 'known',    label: 'Known',    count: deckWords.value.filter(w => w.status === 'known').length },
])

const filteredWords = computed(() => {
  let words = activeFilter.value === 'all'
    ? deckWords.value
    : deckWords.value.filter(w => w.status === activeFilter.value)

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    words = words.filter(w =>
      w.word?.toLowerCase().includes(q) || w.translation?.toLowerCase().includes(q)
    )
  }
  return words
})

const statItems = computed(() => [
  { label: 'Total',    value: deckWords.value.length,                                       color: 'var(--color-text)' },
  { label: 'Due',      value: deckStats.value.dueCount,                                      color: 'var(--color-accent)' },
  { label: 'Learning', value: deckWords.value.filter(w => w.status === 'learning').length,  color: 'var(--color-hard)' },
  { label: 'Known',    value: deckWords.value.filter(w => w.status === 'known').length,     color: 'var(--color-good)' },
])

const showAddWord = ref(false)
const newWord = reactive({ word: '', translation: '', example: '', notes: '' })

async function submitWord() {
  if (!newWord.word.trim()) return
  await wordsStore.addWord({
    ...newWord,
    deckId: deckId.value,
    language: deck.value?.language ?? '',
  })
  toast.success(`"${newWord.word}" added`)
  Object.assign(newWord, { word: '', translation: '', example: '', notes: '' })
  showAddWord.value = false
}

async function deleteWord(id) {
  await wordsStore.deleteWord(id)
  toast.info('Word removed')
}

const showEditForm = ref(false)

async function updateDeck(data) {
  await decksStore.updateDeck(deckId.value, data)
  showEditForm.value = false
  toast.success('Deck updated')
}

async function confirmDelete() {
  if (!confirm(`Delete "${deck.value.name}"? All words will be lost.`)) return
  await decksStore.deleteDeck(deckId.value)
  toast.info('Deck deleted')
  router.push({ name: 'decks' })
}

function goStudy() {
  router.push({ name: 'study', params: { deckId: deckId.value } })
}

function sourceIcon(type) {
  return { music: 'ti-music', movie: 'ti-movie', reader: 'ti-book-2' }[type] ?? 'ti-pencil'
}

function intervalLabel(word) {
  if (word.status === 'new')   return 'new'
  if (word.status === 'known') return 'known'
  if (!word.nextReview)        return '—'
  const d = daysUntilReview(word.nextReview)
  if (d <= 0) return 'due'
  return d === 1 ? 'tomorrow' : `${d}d`
}
</script>

<style scoped>
.deck-detail {
  padding: var(--space-8);
  max-width: 860px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.deck-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.deck-header__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  text-decoration: none;
  transition: color 140ms;
}
.back-link:hover { color: var(--color-text); }
.back-link .ti { font-size: 14px; }

.deck-header__actions { display: flex; gap: var(--space-2); }

.deck-header__body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
}

.deck-header__lang {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--color-accent);
  letter-spacing: 0.1em;
  display: block;
  margin-bottom: var(--space-1);
}

.deck-header__name {
  font-size: var(--text-2xl);
  letter-spacing: -0.02em;
}

.deck-stats {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-4) var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
}

.deck-stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 40px;
}

.deck-stat-item__value {
  font-size: var(--text-lg);
  font-weight: var(--weight-medium);
  line-height: 1;
}

.deck-stat-item__label {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  white-space: nowrap;
}

.deck-stat-item--bar {
  flex: 1;
  gap: var(--space-2);
}

.progress-bar {
  height: 4px;
  background: var(--color-surface-3);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width 600ms cubic-bezier(0.22, 1, 0.36, 1);
}

.words-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  gap: 2px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 3px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  background: none;
  border: none;
  cursor: pointer;
  transition: background 120ms, color 120ms;
  white-space: nowrap;
}

.filter-tab:hover { color: var(--color-text-muted); }

.filter-tab--active {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.filter-tab__count {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-faint);
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-3);
  flex: 1;
  max-width: 240px;
  transition: border-color 140ms;
}
.search-box:focus-within { border-color: var(--color-accent); }

.search-box .ti-search { font-size: 14px; color: var(--color-text-faint); flex-shrink: 0; }

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: var(--text-sm);
  color: var(--color-text);
  min-width: 0;
}
.search-input::placeholder { color: var(--color-text-faint); }

.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-faint);
  font-size: 12px;
  padding: 0;
  display: flex;
  transition: color 120ms;
}
.search-clear:hover { color: var(--color-text); }

.word-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.word-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--color-border-muted);
  transition: background 120ms;
}
.word-row:last-child { border-bottom: none; }
.word-row:hover { background: var(--color-surface-2); }
.word-row:hover .word-row__delete { opacity: 1; }

.word-row__status {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--color-border-strong);
}
.word-row__status--new      { background: var(--color-text-faint); }
.word-row__status--learning { background: var(--color-hard); }
.word-row__status--review   { background: var(--color-accent); }
.word-row__status--known    { background: var(--color-good); }

.word-row__content {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  min-width: 0;
}

.word-row__word {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  white-space: nowrap;
}

.word-row__translation {
  font-size: var(--text-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.word-row__source { color: var(--color-text-faint); font-size: 13px; }

.word-row__interval {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  min-width: 60px;
  text-align: right;
}

.word-row__delete {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-faint);
  font-size: 14px;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: opacity 140ms, color 140ms, background 140ms;
}
.word-row__delete:hover { color: var(--color-danger); background: rgba(192,57,43,0.1); }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  padding: var(--space-12) var(--space-8);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-xl);
  color: var(--color-text-faint);
}
.empty-state__icon { font-size: 40px; color: var(--color-border-strong); }
.empty-state h2 { font-size: var(--text-lg); color: var(--color-text); }

.word-form-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  backdrop-filter: blur(2px);
  padding: var(--space-4);
}

.word-form {
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 440px;
  overflow: hidden;
}

.word-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}
.word-form__header h2 { font-size: var(--text-md); font-weight: var(--weight-medium); }

.word-form__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
}

.word-form__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
}

.form-field { display: flex; flex-direction: column; gap: var(--space-2); }
.form-field__label { font-size: var(--text-sm); color: var(--color-text-muted); }

.form-input {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
  transition: border-color 140ms;
  width: 100%;
}
.form-input:focus { border-color: var(--color-accent); }
.form-input::placeholder { color: var(--color-text-faint); }

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
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
.btn:hover:not(:disabled) { transform: translateY(-1px); }

.btn--primary { background: var(--color-accent); color: var(--color-text-inverse); border-color: var(--color-accent); }
.btn--primary:hover:not(:disabled) { background: var(--color-accent-hover); }

.btn--ghost { background: var(--color-surface-2); color: var(--color-text-muted); border-color: var(--color-border-strong); }
.btn--ghost:hover:not(:disabled) { background: var(--color-surface-3); color: var(--color-text); }

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: var(--color-text-faint);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 140ms, background 140ms;
}
.icon-btn:hover { color: var(--color-text); background: var(--color-surface-2); }
.icon-btn--danger:hover { color: var(--color-danger); background: rgba(192,57,43,0.1); }
</style>