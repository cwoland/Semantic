import { ref } from 'vue'
import api from '@/services/api'

export function useAI() {
  const loading = ref(false)
  const error   = ref(null)

  async function generateExamples(word, language, nativeLanguage = 'en') {
    loading.value = true
    error.value   = null

    try {
      const { data } = await api.post('/api/ai/generate-examples', {
        word,
        language,
        nativeLanguage,
      })
      return data.examples ?? []
    } catch (e) {
      error.value = e.response?.data?.error ?? 'Failed to generate examples'
      return []
    } finally {
      loading.value = false
    }
  }

  async function generateDeck(topic, language, nativeLanguage = 'en', count = 10) {
    loading.value = true
    error.value   = null

    try {
      const { data } = await api.post('/api/ai/generate-deck', {
        topic,
        language,
        nativeLanguage,
        count,
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
        word,
        language,
        nativeLanguage,
      })
      return data.explanation ?? null
    } catch (e) {
      error.value = e.response?.data?.error ?? 'Failed to explain word'
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, generateExamples, generateDeck, explainWord }
}