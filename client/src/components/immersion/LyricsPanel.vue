<template>
  <div class="lyrics-panel">
    <div class="lyrics-panel__search">
      <div class="search-row">
        <div class="field">
          <label class="field__label">Artist</label>
          <input v-model="artist" class="form-input" placeholder="e.g. Lucio Battisti" @keydown.enter="fetchLyrics" />
        </div>
        <div class="field">
          <label class="field__label">Song</label>
          <input v-model="song" class="form-input" placeholder="e.g. Emozioni" @keydown.enter="fetchLyrics" />
        </div>
        <button class="btn btn--primary" @click="fetchLyrics" :disabled="loading || !artist || !song">
          <i class="ti ti-search" v-if="!loading" />
          <div class="spinner" v-else />
          Find
        </button>
      </div>
    </div>

    <div class="lyrics-panel__error text-faint" v-if="error">
      {{ error }}
    </div>

    <div class="lyrics-panel__content" v-if="tokens.length">
      <div class="lyrics-panel__meta">
        <span class="text-muted">{{ artist }} — {{ song }}</span>
        <button class="icon-btn" @click="clear" title="Clear">
          <i class="ti ti-x" />
        </button>
      </div>

      <div class="lyrics-panel__text">
        <span
          v-for="token in tokens"
          :key="token.id"
          :class="['lyric-token', {
            'lyric-token--word': token.isWord,
            'lyric-token--saved': savedWords.has(token.word)
          }]"
          @click="token.isWord ? onWordClick(token, $event) : null"
        >{{ token.raw }}</span>
      </div>
    </div>

    <div class="lyrics-panel__empty" v-else-if="!loading">
      <i class="ti ti-music text-faint" style="font-size: 32px" />
      <p class="text-muted">Search for a song to load lyrics</p>
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
import { ref, computed } from 'vue'
import { fetchLyrics as fetchLyricsAPI } from '@/services/lyrics.service'
import { tokenize } from '@/utils/text'
import { useTranslate } from '@/composables/useTranslate'
import { useImmersionStore } from '@/stores/immersion.store'
import { useSettingsStore } from '@/stores/settings.store'
import { useToast } from '@/composables/useToast'
import WordCapture from './WordCapture.vue'

const immersionStore = useImmersionStore()
const settingsStore  = useSettingsStore()
const { result: translateResult, loading: translateLoading, lookup } = useTranslate()
const toast = useToast()

const artist    = ref('')
const song      = ref('')
const rawLyrics = ref('')
const loading   = ref(false)
const error     = ref(null)
const activeWord  = ref(null)
const capturePos  = ref({ x: 0, y: 0 })
const savedWords  = ref(new Set())

const tokens = computed(() => tokenize(rawLyrics.value))

async function fetchLyrics() {
  if (!artist.value || !song.value) return
  loading.value = true
  error.value   = null
  const result  = await fetchLyricsAPI(artist.value, song.value)
  loading.value = false
  if (!result) {
    error.value = `Could not find lyrics for "${song.value}" by ${artist.value}.`
    return
  }
  rawLyrics.value = result
  immersionStore.updateContent({
    title:    song.value,
    subtitle: artist.value,
    body:     result,
    source:   { type: 'lyrics', artist: artist.value, track: song.value },
  })
}

function clear() {
  rawLyrics.value = ''
  error.value     = null
  activeWord.value = null
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
    sourceType:  'music',
    sourceRef:   { artist: artist.value, track: song.value },
  })
  savedWords.value.add(result.word)
  activeWord.value = null
  toast.success(`"${result.word}" saved`)
}
</script>

<style scoped>
.lyrics-panel { display: flex; flex-direction: column; gap: var(--space-5); }

.search-row {
  display: flex;
  gap: var(--space-3);
  align-items: flex-end;
}

.field { display: flex; flex-direction: column; gap: var(--space-2); flex: 1; }
.field__label { font-size: var(--text-xs); color: var(--color-text-muted); }

.form-input {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
  transition: border-color 140ms;
}
.form-input:focus { border-color: var(--color-accent); }
.form-input::placeholder { color: var(--color-text-faint); }

.btn {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--text-sm); font-weight: var(--weight-medium);
  border: none; cursor: pointer;
  transition: background 140ms, opacity 140ms;
  flex-shrink: 0;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn--primary { background: var(--color-accent); color: var(--color-text-inverse); }
.btn--primary:hover:not(:disabled) { background: var(--color-accent-hover); }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 500ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.lyrics-panel__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  font-size: var(--text-sm);
}

.lyrics-panel__text {
  font-family: var(--font-serif);
  font-size: 16px;
  line-height: 2;
  white-space: pre-wrap;
  color: var(--color-text);
}

.lyric-token--word {
  cursor: pointer;
  border-radius: 2px;
  transition: background 120ms;
}
.lyric-token--word:hover { background: var(--color-accent-faint); }
.lyric-token--saved { color: var(--color-accent); text-decoration: underline dotted; }

.lyrics-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-12) var(--space-8);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-xl);
  text-align: center;
}

.icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  border-radius: var(--radius-md);
  background: none; border: none; cursor: pointer;
  color: var(--color-text-faint); font-size: 15px;
  transition: color 140ms, background 140ms;
}
.icon-btn:hover { color: var(--color-text); background: var(--color-surface-2); }
</style>