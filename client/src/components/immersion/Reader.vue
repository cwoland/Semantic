<template>
  <div class="reader">
    <div class="reader__toolbar">
      <input
        v-model="title"
        class="reader__title-input"
        placeholder="Untitled text…"
        aria-label="Text title"
      />
      <div class="reader__controls">
        <label class="reader__font-size" title="Font size">
          <i class="ti ti-typography" aria-hidden="true" />
          <input type="range" v-model.number="fontSize" min="14" max="24" step="1" />
        </label>
        <button class="icon-btn" @click="toggleEdit" :title="editing ? 'Read mode' : 'Edit mode'">
          <i :class="['ti', editing ? 'ti-eye' : 'ti-pencil']" />
        </button>
      </div>
    </div>

    <textarea
      v-if="editing"
      v-model="rawText"
      class="reader__editor"
      placeholder="Paste or type your text here…"
      :style="{ fontSize: fontSize + 'px' }"
    />

    <div
      v-else
      class="reader__content"
      :style="{ fontSize: fontSize + 'px' }"
    >
      <span
        v-for="token in tokens"
        :key="token.id"
        :class="['reader__token', { 'reader__token--word': token.isWord, 'reader__token--saved': savedWords.has(token.word) }]"
        @click="token.isWord ? onWordClick(token, $event) : null"
      >{{ token.raw }}</span>
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

const rawText   = ref('')
const title     = ref('')
const editing   = ref(true)
const fontSize  = ref(17)
const activeWord   = ref(null)
const capturePos   = ref({ x: 0, y: 0 })
const savedWords   = ref(new Set())

const tokens = computed(() => tokenize(rawText.value))

function toggleEdit() {
  editing.value = !editing.value
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
    sourceType:  'reader',
  })
  savedWords.value.add(result.word)
  activeWord.value = null
  toast.success(`"${result.word}" saved`)
}
</script>

<style scoped>
.reader { display: flex; flex-direction: column; gap: var(--space-4); height: 100%; }

.reader__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.reader__title-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}
.reader__title-input::placeholder { color: var(--color-text-faint); }

.reader__controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.reader__font-size {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-faint);
  font-size: 15px;
  cursor: pointer;
}

.reader__font-size input[type="range"] {
  width: 80px;
  accent-color: var(--color-accent);
}

.reader__editor {
  flex: 1;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  color: var(--color-text);
  line-height: var(--leading-loose);
  resize: none;
  outline: none;
  font-family: var(--font-serif);
  transition: border-color 140ms;
  min-height: 300px;
}
.reader__editor:focus { border-color: var(--color-accent); }

.reader__content {
  flex: 1;
  line-height: var(--leading-loose);
  font-family: var(--font-serif);
  color: var(--color-text);
  white-space: pre-wrap;
  word-break: break-word;
}

.reader__token--word {
  cursor: pointer;
  border-radius: 2px;
  transition: background 120ms;
}
.reader__token--word:hover { background: var(--color-accent-faint); }
.reader__token--saved { color: var(--color-accent); text-decoration: underline dotted; }

.icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px;
  border-radius: var(--radius-md);
  background: none; border: none; cursor: pointer;
  color: var(--color-text-faint); font-size: 16px;
  transition: color 140ms, background 140ms;
}
.icon-btn:hover { color: var(--color-text); background: var(--color-surface-2); }
</style>