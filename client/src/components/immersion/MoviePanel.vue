<template>
  <div class="movie-panel">

    <div class="movie-search">
      <div class="search-row">
        <div class="field">
          <label class="field__label">Movie or TV Show</label>
          <input
            v-model="query"
            class="form-input"
            placeholder="e.g. La Vita è Bella, Money Heist…"
            @keydown.enter="searchMovie"
          />
        </div>
        <button
          class="btn btn--primary"
          @click="searchMovie"
          :disabled="searching || !query.trim()"
        >
          <div class="spinner" v-if="searching" />
          <i class="ti ti-search" v-else />
          Search
        </button>
      </div>
    </div>

    <div class="movie-results" v-if="results.length">
      <div
        v-for="movie in results"
        :key="movie.imdbID"
        class="movie-result"
        :class="{ 'movie-result--active': selected?.imdbID === movie.imdbID }"
        @click="selectMovie(movie)"
      >
        <img
          v-if="movie.Poster && movie.Poster !== 'N/A'"
          :src="movie.Poster"
          :alt="movie.Title"
          class="movie-result__poster"
        />
        <div v-else class="movie-result__no-poster">
          <i class="ti ti-movie" />
        </div>
        <div class="movie-result__info">
          <p class="movie-result__title">{{ movie.Title }}</p>
          <p class="movie-result__meta text-faint">{{ movie.Year }} · {{ movie.Type }}</p>
        </div>
      </div>
    </div>

    <div class="movie-content" v-if="selected">
      <div class="movie-selected">
        <img
          v-if="selected.Poster && selected.Poster !== 'N/A'"
          :src="selected.Poster"
          class="movie-selected__poster"
        />
        <div class="movie-selected__info">
          <p class="movie-selected__title">{{ selected.Title }}</p>
          <p class="text-muted" style="font-size: var(--text-xs)">{{ selected.Year }}</p>
        </div>
      </div>

      <div class="subtitle-section">
        <label class="field__label">
          Paste subtitles or dialogue
          <span class="text-faint" style="font-size: 10px">(SRT or plain text)</span>
        </label>
        <textarea
          v-model="subtitleText"
          class="form-input subtitle-input"
          placeholder="00:01:23 --> 00:01:26&#10;Ciao, come stai?&#10;&#10;00:01:27 --> 00:01:30&#10;Bene, grazie!"
          rows="6"
        />
        <button
          class="btn btn--ghost btn--sm"
          @click="loadSubtitles"
          :disabled="!subtitleText.trim()"
        >
          <i class="ti ti-player-play" />
          Load subtitles
        </button>
      </div>

      <div class="subtitle-reader" v-if="subtitleLines.length">
        <div
          v-for="(line, i) in subtitleLines"
          :key="i"
          class="subtitle-line"
        >
          <span class="subtitle-line__time text-faint" v-if="line.time">
            {{ line.time }}
          </span>
          <div class="subtitle-line__text">
            <span
              v-for="token in line.tokens"
              :key="token.id"
              :class="['subtitle-token', {
                'subtitle-token--word': token.isWord,
                'subtitle-token--saved': savedWords.has(token.word)
              }]"
              @click="token.isWord ? onWordClick(token, $event) : null"
            >{{ token.raw }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="movie-empty" v-if="!selected && !results.length">
      <i class="ti ti-movie" />
      <p class="text-muted">Search for a movie to load subtitles and study vocabulary</p>
    </div>

    <WordCapture
      :visible="!!activeWord"
      :word="activeWord"
      :result="translateResult"
      :loading="translateLoading"
      :pos="capturePos"
      @save="saveWord"
      @dismiss="activeWord = null"
    />

  </div>
</template>

<script setup>
import { ref, computed }     from 'vue'
import { tokenize }          from '@/utils/text'
import { useTranslate }      from '@/composables/useTranslate'
import { useImmersionStore } from '@/stores/immersion.store'
import { useSettingsStore }  from '@/stores/settings.store'
import { useToast }          from '@/composables/useToast'
import api                   from '@/services/api'
import WordCapture           from './WordCapture.vue'

const immersionStore = useImmersionStore()
const settingsStore  = useSettingsStore()
const { result: translateResult, loading: translateLoading, lookup } = useTranslate()
const toast = useToast()

const query        = ref('')
const results      = ref([])
const selected     = ref(null)
const searching    = ref(false)
const subtitleText = ref('')
const activeWord   = ref(null)
const capturePos   = ref({ x: 0, y: 0 })
const savedWords   = ref(new Set())

const subtitleLines = computed(() => {
  if (!subtitleText.value.trim()) return []
  const raw   = subtitleText.value
  const lines = raw.split('\n')
  const result = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const isTimestamp = /\d{2}:\d{2}:\d{2}/.test(trimmed) && trimmed.includes('-->')
    if (isTimestamp) continue

    if (/^\d+$/.test(trimmed)) continue

    const timeMatch = trimmed.match(/^\[?(\d{2}:\d{2})\]?\s*(.*)/)
    if (timeMatch) {
      result.push({
        time:   timeMatch[1],
        tokens: tokenize(timeMatch[2]),
      })
    } else {
      result.push({
        time:   null,
        tokens: tokenize(trimmed),
      })
    }
  }
  return result
})

async function searchMovie() {
  if (!query.value.trim()) return
  searching.value = true
  try {
    const { data } = await api.get('/api/movies/search', {
      params: { q: query.value }
    })
    results.value = data.results ?? []
  } catch {
    toast.error('Movie search failed')
  } finally {
    searching.value = false
  }
}

function selectMovie(movie) {
  selected.value = movie
  results.value  = []
  immersionStore.updateContent({
    title:  movie.Title,
    subtitle: movie.Year,
    source: { type: 'movie', title: movie.Title, year: movie.Year },
  })
}

function loadSubtitles() {
  toast.info('Subtitles loaded — click any word to look it up')
}

async function onWordClick(token, event) {
  if (!token.word) return
  const rect = event.target.getBoundingClientRect()
  capturePos.value = { x: rect.left, y: rect.top }
  activeWord.value = token.word
  await lookup(token.word, settingsStore.targetLanguage)
}

function saveWord(result) {
  immersionStore.captureWord({
    word:        result.word,
    translation: result.translation || result.definition,
    example:     result.example,
    language:    settingsStore.targetLanguage,
    sourceType:  'movie',
    sourceRef:   {
      title: selected.value?.Title,
      year:  selected.value?.Year,
    },
  })
  savedWords.value.add(result.word)
  activeWord.value = null
  toast.success(`"${result.word}" saved`)
}
</script>

<style scoped>
.movie-panel { display: flex; flex-direction: column; gap: var(--space-5); }

.search-row {
  display: flex;
  gap: var(--space-3);
  align-items: flex-end;
}

.field { display: flex; flex-direction: column; gap: var(--space-2); flex: 1; }
.field__label { font-size: var(--text-xs); color: var(--color-text-muted); font-weight: 500; }

.form-input {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
  width: 100%;
  transition: border-color 140ms;
}
.form-input:focus { border-color: var(--color-accent); }
.form-input::placeholder { color: var(--color-text-faint); }

.subtitle-input {
  resize: vertical;
  min-height: 120px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  line-height: 1.6;
}

.movie-results {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 280px;
  overflow-y: auto;
}

.movie-result {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 160ms;
}
.movie-result:hover { border-color: var(--color-accent); background: var(--color-accent-faint); }
.movie-result--active { border-color: var(--color-accent); background: var(--color-accent-faint); }

.movie-result__poster {
  width: 40px;
  height: 56px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.movie-result__no-poster {
  width: 40px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-3);
  border-radius: var(--radius-sm);
  color: var(--color-text-faint);
  font-size: 20px;
  flex-shrink: 0;
}

.movie-result__title {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.movie-result__meta { font-size: var(--text-xs); margin-top: 2px; }

.movie-selected {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-surface-2);
  border-radius: var(--radius-lg);
}

.movie-selected__poster {
  width: 40px;
  height: 56px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.movie-selected__title { font-size: var(--text-sm); font-weight: 500; }

.subtitle-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.subtitle-reader {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 400px;
  overflow-y: auto;
  padding: var(--space-4);
  background: var(--color-surface-2);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.subtitle-line {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border-muted);
}
.subtitle-line:last-child { border-bottom: none; }

.subtitle-line__time {
  font-size: 10px;
  font-family: var(--font-mono);
  min-width: 40px;
  padding-top: 2px;
  flex-shrink: 0;
}

.subtitle-line__text {
  font-family: var(--font-serif);
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.subtitle-token--word {
  cursor: pointer;
  border-radius: 2px;
  transition: background 120ms;
}
.subtitle-token--word:hover { background: var(--color-accent-faint); }
.subtitle-token--saved { color: var(--color-accent); text-decoration: underline dotted; }

.movie-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-12) var(--space-8);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-xl);
  text-align: center;
}
.movie-empty .ti { font-size: 32px; color: var(--color-text-faint); }

.btn {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md); font-size: var(--text-sm);
  font-weight: 500; border: none; cursor: pointer;
  transition: all 140ms; flex-shrink: 0;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn--sm { padding: var(--space-2) var(--space-4); font-size: var(--text-xs); }
.btn--primary { background: var(--color-accent); color: white; }
.btn--primary:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn--ghost {
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border-strong);
}
.btn--ghost:hover:not(:disabled) { background: var(--color-surface-3); }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 500ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .search-row { flex-direction: column; }
  .search-row .btn { width: 100%; justify-content: center; }
}
</style>