import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/db'
import { useWordsStore } from './words.store'

export const useDecksStore = defineStore('decks', () => {
  const decks    = ref([])
  const activeId = ref(null)
  const loading  = ref(false)

  const activeDeck = computed(() =>
    decks.value.find(d => d.id === activeId.value) ?? null
  )

  const deckById = computed(() => (id) =>
    decks.value.find(d => d.id === id) ?? null
  )

  const deckProgress = computed(() => {
    const wordsStore = useWordsStore()
    return decks.value.map(deck => {
      const deckWords = wordsStore.getWordsByDeck(deck.id)
      const due       = wordsStore.getDueByDeck(deck.id)
      return {
        ...deck,
        totalWords: deckWords.length,
        dueCount:   due.length,
        knownCount: deckWords.filter(w => w.status === 'known').length,
        progress:   deckWords.length
          ? Math.round(deckWords.filter(w => w.status === 'known').length / deckWords.length * 100)
          : 0,
      }
    })
  })

  async function loadDecks() {
    loading.value = true
    decks.value = await db.decks.toArray()
    loading.value = false
  }

  async function createDeck(data) {
    const deck = {
      name:        'Untitled Deck',
      description: '',
      language:    '',
      tags:        [],
      createdAt:   Date.now(),
      updatedAt:   Date.now(),
      settings: {
        dailyNewLimit:    20,
        dailyReviewLimit: 100,
      },
      ...data,
    }

    const id = await db.decks.add(deck)
    deck.id = id
    decks.value.push(deck)
    return deck
  }

  async function updateDeck(id, updates) {
    const payload = { ...updates, updatedAt: Date.now() }
    await db.decks.update(id, payload)
    const idx = decks.value.findIndex(d => d.id === id)
    if (idx !== -1) Object.assign(decks.value[idx], payload)
  }

  async function deleteDeck(id) {
    await db.words.where('deckId').equals(id).delete()
    await db.decks.delete(id)
    decks.value = decks.value.filter(d => d.id !== id)
    if (activeId.value === id) activeId.value = null
  }

  function setActive(id) {
    activeId.value = id
  }

  return {
    decks, activeId, loading,
    activeDeck, deckById, deckProgress,
    loadDecks, createDeck, updateDeck, deleteDeck, setActive,
  }
})