import { ref } from 'vue'
import api from '@/services/api'

export function useAI() {
  const loading = ref(false)
  const error   = ref(null)

  async function generateDeck(topic, language, nativeLanguage = 'en', count = 10) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.post('/api/ai/generate-deck', {
        topic, language, nativeLanguage, count
      })
      return data.words ?? []
    } catch (e) {
      error.value = e.response?.data?.error ?? 'Failed to generate deck'
      return []
    } finally {
      loading.value = false
    }
  }

  async function explainWord(word, language, nativeLanguage = 'en') {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.post('/api/ai/explain-word', {
        word, language, nativeLanguage
      })
      return data
    } catch (e) {
      error.value = 'Failed to explain word'
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, generateDeck, explainWord }
}