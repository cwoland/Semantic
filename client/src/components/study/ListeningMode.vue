<template>
  <div class="listening-mode">

    <div class="listening-mode__header">
      <h3>Listening Practice</h3>
      <span class="listening-mode__lang">{{ langCode }}</span>
    </div>

    <div class="listening-word">
      <p class="word-display" v-if="revealed">{{ currentWord.word }}</p>
      <p class="word-display word-display--hidden" v-else>????</p>
      <p class="word-translation text-muted" v-if="revealed">{{ currentWord.translation }}</p>
    </div>

    <div class="listening-controls">

      <button
        class="listen-btn listen-btn--play"
        @click="playWord"
        :disabled="speaking"
        title="Play pronunciation"
      >
        <i :class="['ti', speaking ? 'ti-volume' : 'ti-player-play']" />
        {{ speaking ? 'Playing…' : 'Listen' }}
      </button>

      <button
        class="listen-btn listen-btn--record"
        @click="toggleRecording"
        :class="{ 'listen-btn--recording': isRecording }"
        title="Speak the word"
      >
        <i :class="['ti', isRecording ? 'ti-microphone' : 'ti-microphone-off']" />
        {{ isRecording ? 'Listening…' : 'Speak' }}
      </button>

      <button class="listen-btn listen-btn--reveal" @click="revealed = !revealed">
        <i class="ti ti-eye" />
        {{ revealed ? 'Hide' : 'Reveal' }}
      </button>

    </div>

    <div class="recognition-result" v-if="transcript">
      <div class="recognition-result__text" :class="recognitionStatus">
        <i :class="['ti', recognitionStatus === 'correct' ? 'ti-circle-check' : 'ti-circle-x']" />
        "{{ transcript }}"
      </div>
      <p class="text-faint" style="font-size: var(--text-xs)">
        {{ recognitionStatus === 'correct' ? 'Correct!' : `Expected: ${currentWord.word}` }}
      </p>
    </div>

    <div class="not-supported" v-if="!speechSupported">
      <i class="ti ti-microphone-off" />
      <p class="text-muted">Speech recognition is not supported in this browser.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useSpeech } from '@/composables/useSpeech'
import { useSettingsStore } from '@/stores/settings.store'

const props = defineProps({
  currentWord: { type: Object, required: true },
})

const emit = defineEmits(['correct', 'incorrect'])

const settingsStore  = useSettingsStore()
const { speak, speaking, langCode: getLangCode } = useSpeech()

const revealed     = ref(false)
const transcript   = ref('')
const isRecording  = ref(false)
let   recognition  = null

const langCode = computed(() =>
  getLangCode(props.currentWord.language || settingsStore.targetLanguage)
)

const speechSupported = computed(() =>
  'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
)

const recognitionStatus = computed(() => {
  if (!transcript.value) return ''
  const spoken   = transcript.value.toLowerCase().trim()
  const expected = props.currentWord.word.toLowerCase().trim()
  return spoken.includes(expected) || expected.includes(spoken) ? 'correct' : 'incorrect'
})

function playWord() {
  speak(props.currentWord.word, langCode.value)
}

function toggleRecording() {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

function startRecording() {
  if (!speechSupported.value) return

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SR()

  recognition.lang        = langCode.value
  recognition.continuous  = false
  recognition.interimResults = false

  recognition.onresult = (e) => {
    transcript.value = e.results[0][0].transcript
    isRecording.value = false

    if (recognitionStatus.value === 'correct') {
      emit('correct')
    } else {
      emit('incorrect')
    }
  }

  recognition.onerror = () => { isRecording.value = false }
  recognition.onend   = () => { isRecording.value = false }

  recognition.start()
  isRecording.value = true
  transcript.value  = ''
}

function stopRecording() {
  recognition?.stop()
  isRecording.value = false
}

onUnmounted(() => recognition?.stop())
</script>

<style scoped>
.listening-mode {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
}

.listening-mode__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.listening-mode__header h3 {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
}

.listening-mode__lang {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.listening-word { text-align: center; }

.word-display--hidden {
  color: var(--color-surface-3);
  letter-spacing: 0.2em;
}

.listening-controls {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

.listen-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 160ms;
}

.listen-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.listen-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.listen-btn--play:hover:not(:disabled) {
  background: var(--color-accent-faint);
}

.listen-btn--record.listen-btn--recording {
  background: rgba(192,57,43,0.1);
  border-color: var(--color-danger);
  color: var(--color-danger);
  animation: pulse 1.5s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.7; }
}

.recognition-result {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.recognition-result__text {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  margin: 0 auto;
}

.recognition-result__text.correct {
  color: var(--color-success);
  background: rgba(61,153,112,0.1);
}

.recognition-result__text.incorrect {
  color: var(--color-danger);
  background: rgba(192,57,43,0.1);
}

.not-supported {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-surface-2);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
}
.not-supported .ti { font-size: 18px; color: var(--color-text-faint); }
</style>