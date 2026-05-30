<template>
  <div class="ai-generator">

    <div class="ai-generator__header">
      <div class="ai-badge">
        <i class="ti ti-sparkles" />
        AI
      </div>
      <h3>{{ t.ai_decks_title }}</h3>
    </div>

    <p class="text-muted" style="font-size: var(--text-sm)">
      {{t.ai_decks_title_desc}}
    </p>

    <div class="form-group">
      <label class="form-label">{{t.ai_decks_topic}}</label>
      <input
        v-model="topic"
        class="form-input"
        placeholder="t.ai_decks_topic_placeholder"
        @keydown.enter="generate"
      />
    </div>

    <div class="ai-options">
      <div class="form-group">
        <label class="form-label">{{t.ai_decks_language}}</label>
        <select v-model="language" class="form-input form-select">
          <option v-for="l in LANGUAGES" :key="l.code" :value="l.code">
            {{ l.flag }} {{ l.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">{{ t.ai_decks_word_count }}</label>
        <select v-model="wordCount" class="form-input form-select">
          <option :value="10">{{t.ai_decks_10}}</option>
          <option :value="20">{{t.ai_decks_20}}</option>
          <option :value="30">{{t.ai_decks_30}}</option>
        </select>
      </div>
    </div>

    <button
      class="btn btn--ai"
      @click="generate"
      :disabled="!topic.trim() || aiLoading"
    >
      <div class="spinner-light" v-if="aiLoading" />
      <i class="ti ti-sparkles" v-else />
      {{ aiLoading ? t.ai_decks_btn_active : t.ai_decks_btn_gen }}
    </button>

    <Transition name="slide-up">
      <div class="ai-preview" v-if="generatedWords.length">
        <div class="ai-preview__header">
          <span class="text-muted" style="font-size: var(--text-sm)">
            {{ generatedWords.length }} {{t.ai_decks_generated}}
          </span>
          <button class="regenerate-btn" @click="generate">
            <i class="ti ti-refresh" />
            {{t.ai_decks_regenerate}}
          </button>
        </div>

        <div class="ai-word-list">
          <div
            v-for="(word, i) in generatedWords"
            :key="i"
            class="ai-word-row"
          >
            <span class="ai-word-row__word">{{ word.word }}</span>
            <span class="ai-word-row__sep text-faint">→</span>
            <span class="ai-word-row__translation text-muted">{{ word.translation }}</span>
          </div>
        </div>

        <button
          class="btn btn--primary btn--full"
          @click="saveDeck"
          :disabled="saving"
        >
          <div class="spinner" v-if="saving" />
          <i class="ti ti-download" v-else />
          {{t.ai_decks_btn_save}}
        </button>
      </div>
    </Transition>

    <div class="ai-error" v-if="aiError">
      <i class="ti ti-alert-circle" />
      {{ aiError }}
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAI }          from '@/composables/useAI'
import { useDecksStore }  from '@/stores/decks.store'
import { useWordsStore }  from '@/stores/words.store'
import { useSettingsStore } from '@/stores/settings.store'
import { useToast }       from '@/composables/useToast'
import { useI18n }        from '@/composables/useI18n'

const emit = defineEmits(['created'])

const decksStore    = useDecksStore()
const wordsStore    = useWordsStore()
const settingsStore = useSettingsStore()
const toast         = useToast()
const { t }         = useI18n()

const { loading: aiLoading, error: aiError, generateDeck } = useAI()

const topic          = ref('')
const language       = ref(settingsStore.targetLanguage || 'it')
const wordCount      = ref(10)
const generatedWords = ref([])
const saving         = ref(false)

const LANGUAGES = [
  { code: 'it', name: 'Italian',    flag: '🇮🇹' },
  { code: 'es', name: 'Spanish',    flag: '🇪🇸' },
  { code: 'fr', name: 'French',     flag: '🇫🇷' },
  { code: 'de', name: 'German',     flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese',   flag: '🇯🇵' },
  { code: 'en', name: 'English',    flag: '🇬🇧' },
]

async function generate() {
  if (!topic.value.trim()) return
  try {
    generatedWords.value = await generateDeck(
      topic.value,
      language.value,
      settingsStore.nativeLanguage || 'en',
      wordCount.value
    )
    if (!generatedWords.value.length && aiError.value) {
      toast.error(aiError.value)
    }
  } catch (err) {
    toast.error('Failed to generate deck')
    generatedWords.value = []
  }
}

async function saveDeck() {
  if (!generatedWords.value.length) return
  saving.value = true

  try {
    const deck = await decksStore.createDeck({
      name:        topic.value,
      language:    language.value,
      description: `AI-generated deck about "${topic.value}"`,
      tags:        ['ai-generated'],
    })

    for (const w of generatedWords.value) {
      await wordsStore.addWord({
        ...w,
        deckId:     deck.id,
        language:   language.value,
        sourceType: 'manual',
      })
    }

    toast.success(`"${topic.value}" deck created with ${generatedWords.value.length} words`)
    generatedWords.value = []
    topic.value = ''
    emit('created', deck)
  } catch {
    toast.error('Failed to save deck')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.ai-generator {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.ai-generator__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--lilac-500), var(--lilac-300));
  color: white;
  letter-spacing: 0.05em;
}

.ai-generator__header h3 {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--color-text);
}

.form-group { display: flex; flex-direction: column; gap: var(--space-2); }
.form-label { font-size: var(--text-sm); font-weight: 500; color: var(--color-text-muted); }

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

.form-select {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%236b6966' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-3) center;
  padding-right: var(--space-8);
}

.ai-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.btn {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg); font-size: var(--text-sm);
  font-weight: 500; border: none; cursor: pointer;
  transition: all 140ms;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn--full { width: 100%; justify-content: center; }

.btn--ai {
  background: linear-gradient(135deg, var(--lilac-600), var(--lilac-400));
  color: white;
  width: 100%;
  justify-content: center;
}
.btn--ai:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--lilac-500), var(--lilac-300));
  transform: translateY(-1px);
}

.btn--primary { background: var(--color-accent); color: white; }
.btn--primary:hover:not(:disabled) { background: var(--color-accent-hover); }

.regenerate-btn {
  display: flex; align-items: center; gap: 4px;
  background: none; border: none; cursor: pointer;
  font-size: var(--text-xs); color: var(--color-text-faint);
  transition: color 140ms;
}
.regenerate-btn:hover { color: var(--color-accent); }

.ai-preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface-2);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.ai-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-word-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  max-height: 200px;
  overflow-y: auto;
}

.ai-word-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) 0;
  font-size: var(--text-sm);
  border-bottom: 1px solid var(--color-border-muted);
}
.ai-word-row:last-child { border-bottom: none; }

.ai-word-row__word        { font-weight: 500; color: var(--color-text); }
.ai-word-row__sep         { font-size: var(--text-xs); }
.ai-word-row__translation { color: var(--color-text-muted); }

.ai-error {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: rgba(192,57,43,0.08);
  border: 1px solid rgba(192,57,43,0.2);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-danger);
}

.spinner, .spinner-light {
  width: 14px; height: 14px; border-radius: 50%;
  animation: spin 500ms linear infinite;
}
.spinner       { border: 2px solid rgba(255,255,255,0.3); border-top-color: white; }
.spinner-light { border: 2px solid rgba(255,255,255,0.3); border-top-color: white; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>