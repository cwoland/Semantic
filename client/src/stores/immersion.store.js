import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useImmersionStore = defineStore('immersion', () => {

  const mode        = ref(null)
  const isActive    = ref(false)
  const timerMs     = ref(0)
  let   timerHandle = null

  const content = ref({
    title:    '',
    subtitle: '',
    body:     '',
    language: '',
    source:   null,
  })
  const pendingWords = ref([])

  const timerFormatted = computed(() => {
    const s = Math.floor(timerMs.value / 1000)
    const m = Math.floor(s / 60)
    return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  })

  const hasPendingWords = computed(() => pendingWords.value.length > 0)

  function startImmersion(selectedMode, contentData = {}) {
    mode.value     = selectedMode
    isActive.value = true
    timerMs.value  = 0
    content.value  = { title: '', subtitle: '', body: '', language: '', source: null, ...contentData }
    pendingWords.value = []
    startTimer()
  }

  function stopImmersion() {
    isActive.value = false
    stopTimer()
  }

  function updateContent(data) {
    Object.assign(content.value, data)
  }

  function captureWord(wordData) {
    const exists = pendingWords.value.some(w => w.word === wordData.word)
    if (!exists) pendingWords.value.push({ ...wordData, capturedAt: Date.now() })
  }

  function removePending(word) {
    pendingWords.value = pendingWords.value.filter(w => w.word !== word)
  }

  async function savePendingToDecks(deckId, wordsStore) {
    const saved = []
    for (const w of pendingWords.value) {
      const word = await wordsStore.addWord({
        ...w,
        deckId,
        sourceType: mode.value,
        sourceRef:  content.value.source,
      })
      saved.push(word)
    }
    pendingWords.value = []
    return saved
  }

  function startTimer() {
    stopTimer()
    timerHandle = setInterval(() => { timerMs.value += 1000 }, 1000)
  }

  function stopTimer() {
    if (timerHandle) { clearInterval(timerHandle); timerHandle = null }
  }

  return {
    mode, isActive, timerMs, content, pendingWords,
    timerFormatted, hasPendingWords,
    startImmersion, stopImmersion, updateContent,
    captureWord, removePending, savePendingToDecks,
  }
})