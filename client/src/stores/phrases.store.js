import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/db'

export const usePhrasesStore = defineStore('phrases', () => {
  const phrases = ref([])
  const loading = ref(false)

  const bySource = computed(() => (sourceType) =>
    phrases.value.filter(p => p.sourceType === sourceType)
  )

  const byLanguage = computed(() => (lang) =>
    phrases.value.filter(p => p.language === lang)
  )

  const allTags = computed(() =>
    [...new Set(phrases.value.flatMap(p => p.tags))]
  )

  async function loadPhrases() {
    loading.value = true
    phrases.value = await db.phrases.toArray()
    loading.value = false
  }

  async function savePhrase(data) {
    const phrase = {
      text:        '',
      translation: '',
      context:     '',
      language:    '',
      tags:        [],
      savedAt:     Date.now(),
      sourceType:  'manual',
      sourceRef:   null,
      ...data,
    }

    const id = await db.phrases.add(phrase)
    phrase.id = id
    phrases.value.push(phrase)
    return phrase
  }

  async function updatePhrase(id, updates) {
    await db.phrases.update(id, updates)
    const idx = phrases.value.findIndex(p => p.id === id)
    if (idx !== -1) Object.assign(phrases.value[idx], updates)
  }

  async function deletePhrase(id) {
    await db.phrases.delete(id)
    phrases.value = phrases.value.filter(p => p.id !== id)
  }

  async function promoteToWord(phraseId, deckId, wordsStore) {
    const phrase = phrases.value.find(p => p.id === phraseId)
    if (!phrase) return null
    return wordsStore.addWord({
      word:       phrase.text,
      translation:phrase.translation,
      language:   phrase.language,
      notes:      phrase.context,
      tags:       phrase.tags,
      sourceType: phrase.sourceType,
      sourceRef:  phrase.sourceRef,
      deckId,
    })
  }

  return {
    phrases, loading,
    bySource, byLanguage, allTags,
    loadPhrases, savePhrase, updatePhrase, deletePhrase, promoteToWord,
  }
})