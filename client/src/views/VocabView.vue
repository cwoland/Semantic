<template>
  <div class="vocab-view">

    <header class="page-header">
      <div>
        <h1 class="page-title">{{ t.vocab_title }}</h1>
        <p class="text-muted" style="font-size: var(--text-sm); margin-top: var(--space-1)">
          {{ wordsStore.totalCount }} words · {{ wordsStore.knownCount }} known
        </p>
      </div>
    </header>

    <div class="vocab-toolbar">

      <div class="search-box">
        <i class="ti ti-search" aria-hidden="true" />
        <input
          v-model="searchQuery"
          class="search-input"
          :placeholder="t.vocab_search"
          :aria-label="t.vocab_search"
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''" aria-label="Clear">
          <i class="ti ti-x" />
        </button>
      </div>

      <div class="filter-tabs" role="tablist">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ 'filter-tab--active': activeStatus === tab.value }"
          role="tab"
          :aria-selected="activeStatus === tab.value"
          @click="activeStatus = tab.value"
        >
          {{ tab.label }}
          <span class="filter-tab__count">{{ tab.count }}</span>
        </button>
      </div>

      <select v-model="activeSource" class="filter-select" :aria-label="t.vocab_sources">
        <option value="all">{{ t.vocab_sources }}</option>
        <option value="manual">{{ t.vocab_manual }}</option>
        <option value="reader">{{ t.vocab_reader }}</option>
        <option value="music">{{ t.vocab_music }}</option>
        <option value="movie">{{ t.vocab_movie }}</option>
      </select>

      <select v-model="activeDeck" class="filter-select" :aria-label="t.vocab_all_decks">
        <option value="all">{{ t.vocab_all_decks }}</option>
        <option v-for="d in decksStore.decks" :key="d.id" :value="d.id">
          {{ d.name }}
        </option>
      </select>

    </div>

    <div class="section-toggle">
      <button
        class="section-btn"
        :class="{ 'section-btn--active': view === 'words' }"
        @click="view = 'words'"
      >
        <i class="ti ti-cards" /> {{ t.vocab_words }}
        <span class="filter-tab__count">{{ wordsStore.totalCount }}</span>
      </button>
      <button
        class="section-btn"
        :class="{ 'section-btn--active': view === 'phrases' }"
        @click="view = 'phrases'"
      >
        <i class="ti ti-quote" /> {{ t.vocab_phrases }}
        <span class="filter-tab__count">{{ phrasesStore.phrases.length }}</span>
      </button>
    </div>

    <div v-if="view === 'words'">
      <div class="word-list" v-if="filteredWords.length">
        <div
          v-for="word in filteredWords"
          :key="word.id"
          class="word-row"
        >
          <span class="word-row__status" :class="`word-row__status--${word.status}`" :title="word.status" />

          <div class="word-row__content">
            <span class="word-row__word">{{ word.word }}</span>
            <span class="word-row__sep text-faint">→</span>
            <span class="word-row__translation text-muted">{{ word.translation }}</span>
          </div>

          <span class="word-row__example text-faint" v-if="word.example">
            "{{ word.example }}"
          </span>

          <div class="word-row__right">
            <span class="word-row__source" v-if="word.sourceType !== 'manual'">
              <i :class="['ti', sourceIcon(word.sourceType)]" aria-hidden="true" />
            </span>
            <span class="word-row__deck text-faint">
              {{ deckName(word.deckId) }}
            </span>
            <span class="word-row__interval">{{ intervalLabel(word) }}</span>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <i class="ti ti-cards empty-state__icon" />
        <p class="text-muted">
          {{ searchQuery ? `No words match "${searchQuery}"` : t.decks_no_words }}
        </p>
      </div>
    </div>

    <div v-if="view === 'phrases'">
      <div class="phrase-list" v-if="phrasesStore.phrases.length">
        <div
          v-for="phrase in phrasesStore.phrases"
          :key="phrase.id"
          class="phrase-row"
        >
          <div class="phrase-row__content">
            <span class="phrase-row__text">{{ phrase.text }}</span>
            <span class="phrase-row__translation text-muted">{{ phrase.translation }}</span>
          </div>
          <span class="phrase-row__context text-faint" v-if="phrase.context">
            {{ phrase.context }}
          </span>
          <div class="phrase-row__right">
            <span class="word-row__source" v-if="phrase.sourceType !== 'manual'">
              <i :class="['ti', sourceIcon(phrase.sourceType)]" />
            </span>
            <button
              class="icon-btn"
              @click="deletePhrase(phrase.id)"
              aria-label="Delete phrase"
            >
              <i class="ti ti-trash" />
            </button>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <i class="ti ti-quote empty-state__icon" />
        <p class="text-muted">{{ t.vocab_no_phrases }}</p>
        <RouterLink :to="{ name: 'immersion' }" class="btn btn--ghost" style="margin-top: var(--space-3)">
          {{ t.vocab_go_immersion }}
        </RouterLink>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWordsStore }   from '@/stores/words.store'
import { useDecksStore }   from '@/stores/decks.store'
import { usePhrasesStore } from '@/stores/phrases.store'
import { useToast }        from '@/composables/useToast'
import { useI18n }         from '@/composables/useI18n'
import { daysUntilReview } from '@/utils/sm2'

const wordsStore   = useWordsStore()
const decksStore   = useDecksStore()
const phrasesStore = usePhrasesStore()
const toast        = useToast()
const { t }        = useI18n()

const view         = ref('words')
const searchQuery  = ref('')
const activeStatus = ref('all')
const activeSource = ref('all')
const activeDeck   = ref('all')

const statusTabs = computed(() => [
  { value: 'all',      label: t.vocab_all,      count: wordsStore.words.length },
  { value: 'new',      label: t.vocab_new,      count: wordsStore.byStatus.new.length },
  { value: 'learning', label: t.vocab_learning, count: wordsStore.byStatus.learning.length },
  { value: 'review',   label: t.vocab_review,   count: wordsStore.byStatus.review.length },
  { value: 'known',    label: t.vocab_known,    count: wordsStore.byStatus.known.length },
])

const filteredWords = computed(() => {
  let words = wordsStore.words

  if (activeStatus.value !== 'all')
    words = words.filter(w => w.status === activeStatus.value)

  if (activeSource.value !== 'all')
    words = words.filter(w => w.sourceType === activeSource.value)

  if (activeDeck.value !== 'all')
    words = words.filter(w => w.deckId === activeDeck.value)

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    words = words.filter(w =>
      w.word?.toLowerCase().includes(q) ||
      w.translation?.toLowerCase().includes(q) ||
      w.example?.toLowerCase().includes(q)
    )
  }

  return words
})

function deckName(deckId) {
  return decksStore.deckById(deckId)?.name ?? '—'
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

async function deletePhrase(id) {
  try {
    await phrasesStore.deletePhrase(id)
    toast.info('Phrase removed')
  } catch (e) {
    console.error('deletePhrase error:', e)
    toast.error('Failed to remove phrase')
  }
}
</script>

<style scoped>
.vocab-view {
  padding: var(--space-8);
  max-width: 900px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.page-header { display: flex; align-items: flex-end; justify-content: space-between; }
.page-title  { font-size: var(--text-2xl); letter-spacing: -0.02em; }

.vocab-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
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
  min-width: 200px;
  transition: border-color 140ms;
}
.search-box:focus-within { border-color: var(--color-accent); }
.search-box .ti-search { font-size: 14px; color: var(--color-text-faint); flex-shrink: 0; }

.search-input {
  flex: 1; background: none; border: none; outline: none;
  font-size: var(--text-sm); color: var(--color-text); min-width: 0;
}
.search-input::placeholder { color: var(--color-text-faint); }

.search-clear {
  background: none; border: none; cursor: pointer;
  color: var(--color-text-faint); font-size: 12px;
  display: flex; transition: color 120ms;
}
.search-clear:hover { color: var(--color-text); }

.filter-tabs {
  display: flex; gap: 2px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 3px;
}

.filter-tab {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  background: none; border: none; cursor: pointer;
  transition: background 120ms, color 120ms;
  white-space: nowrap;
}
.filter-tab:hover { color: var(--color-text-muted); }
.filter-tab--active { background: var(--color-surface-2); color: var(--color-text); }
.filter-tab__count { font-family: var(--font-mono); font-size: 10px; color: var(--color-text-faint); }

.filter-select {
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  outline: none;
  cursor: pointer;
  appearance: none;
  padding-right: var(--space-6);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%236b6966' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-2) center;
  transition: border-color 140ms;
}
.filter-select:focus { border-color: var(--color-accent); }

.section-toggle {
  display: flex;
  gap: 2px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 3px;
  align-self: flex-start;
}

.section-btn {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  background: none; border: none; cursor: pointer;
  color: var(--color-text-faint);
  transition: background 140ms, color 140ms;
}
.section-btn:hover { color: var(--color-text-muted); }
.section-btn--active { background: var(--color-surface-2); color: var(--color-text); }
.section-btn .ti { font-size: 15px; }

.word-list {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.word-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--color-border-muted);
  transition: background 120ms;
}
.word-row:last-child { border-bottom: none; }
.word-row:hover { background: var(--color-surface-2); }

.word-row__status {
  width: 7px; height: 7px;
  border-radius: 50%; flex-shrink: 0;
}
.word-row__status--new      { background: var(--color-text-faint); }
.word-row__status--learning { background: var(--color-hard); }
.word-row__status--review   { background: var(--color-accent); }
.word-row__status--known    { background: var(--color-good); }

.word-row__content {
  flex: 1; display: flex; align-items: baseline;
  gap: var(--space-2); min-width: 0;
}

.word-row__word {
  font-size: var(--text-sm); font-weight: var(--weight-medium);
  color: var(--color-text); white-space: nowrap;
}

.word-row__sep { font-size: var(--text-xs); flex-shrink: 0; }

.word-row__translation {
  font-size: var(--text-sm);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.word-row__example {
  font-size: var(--text-xs); font-style: italic;
  flex: 1; min-width: 0;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  display: none;
}
@media (min-width: 720px) { .word-row__example { display: block; } }

.word-row__right {
  display: flex; align-items: center;
  gap: var(--space-3); flex-shrink: 0;
}

.word-row__source { color: var(--color-text-faint); font-size: 13px; }

.word-row__deck {
  font-size: var(--text-xs);
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden; text-overflow: ellipsis;
}

.word-row__interval {
  font-size: var(--text-xs); font-family: var(--font-mono);
  color: var(--color-text-faint); min-width: 52px; text-align: right;
}

.phrase-list {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.phrase-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border-muted);
  transition: background 120ms;
}
.phrase-row:last-child { border-bottom: none; }
.phrase-row:hover { background: var(--color-surface-2); }
.phrase-row:hover .icon-btn { opacity: 1; }

.phrase-row__content {
  flex: 1; display: flex; flex-direction: column;
  gap: 2px; min-width: 0;
}

.phrase-row__text {
  font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--color-text);
}

.phrase-row__translation { font-size: var(--text-xs); }

.phrase-row__context {
  font-size: var(--text-xs); font-style: italic; flex: 1;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  display: none;
}
@media (min-width: 720px) { .phrase-row__context { display: block; } }

.phrase-row__right { display: flex; align-items: center; gap: var(--space-2); flex-shrink: 0; }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; gap: var(--space-3);
  padding: var(--space-12) var(--space-8);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-xl);
}
.empty-state__icon { font-size: 40px; color: var(--color-border-strong); }

.icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: var(--radius-md);
  background: none; border: none; cursor: pointer;
  color: var(--color-text-faint); font-size: 14px;
  opacity: 0; transition: opacity 140ms, color 140ms, background 140ms;
}
.icon-btn:hover { color: var(--color-danger); background: rgba(192,57,43,0.1); }

.btn {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-5); border-radius: var(--radius-lg);
  font-size: var(--text-sm); font-weight: var(--weight-medium);
  border: 1px solid transparent; cursor: pointer; text-decoration: none;
  transition: background 140ms;
}
.btn--ghost {
  background: var(--color-surface-2); color: var(--color-text-muted);
  border-color: var(--color-border-strong);
}
.btn--ghost:hover { background: var(--color-surface-3); }
</style>