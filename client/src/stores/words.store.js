import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/db'
import { isDue } from '@/utils/sm2'

export const useWordsStore = defineStore('words', () => {
    const words = ref([])
    const loading = ref(false)

    const dueWords = computed(() => 
    words.value.filter(isDue)
    )

    const byStatus = computed(() => ({
        new: words.value.filter(w => w.status === 'new'),
        learning: words.value.filter(w => w.status === 'learning'),
        review: words.value.filter(w => w.status === 'review'),
        known: words.value.filter(w => w.status === 'known'),
    }))

    const totalCount = computed(() => words.value.length)
    const knownCount = computed(() => byStatus.value.known.length)
    const dueCount = computed(() => dueWords.value.length)

    async function loadWords() {
        loading.value = true
        words.value = await db.words.toArray()
        loading.value = false
    }

    async function loadByDeck(deckId) {
        loading.value = true
        words.value = await db.words.where('deckId').equals(deckId).toArray()
        loading.value = false
    }

    async function addWord(data) {
    const word = {
      status:      'new',
      interval:    0,
      repetitions: 0,
      easeFactor:  2.5,
      nextReview:  Date.now(),
      lastSeen:    null,
      addedAt:     Date.now(),
      word:        '',
      translation: '',
      language:    '',
      nativeLanguage: '',
      example:     '',
      notes:       '',
      tags:        [],
      sourceType:  'manual',
      sourceRef:   null,
      deckId:      null,
      ...data,
    }
 
    const id = await db.words.add(word)
    word.id = id
    words.value.push(word)
    return word
  }
 
  async function updateWord(id, updates) {
    await db.words.update(id, updates)
    const idx = words.value.findIndex(w => w.id === id)
    if (idx !== -1) Object.assign(words.value[idx], updates)
  }
 
  async function deleteWord(id) {
    await db.words.delete(id)
    words.value = words.value.filter(w => w.id !== id)
  }

  async function applyReview(id, sm2Result) {
    const updates = {
      ...sm2Result,
      lastSeen: Date.now(),
    }
    await updateWord(id, updates)
  }
 
  function getWordsByDeck(deckId) {
    return words.value.filter(w => w.deckId === deckId)
  }
 
  function getDueByDeck(deckId) {
    return words.value.filter(w => w.deckId === deckId && isDue(w))
  }
 
  return {
    words, loading,

    dueWords, byStatus, totalCount, knownCount, dueCount,

    loadWords, loadByDeck, addWord, updateWord, deleteWord,
    applyReview, getWordsByDeck, getDueByDeck,
  }
})