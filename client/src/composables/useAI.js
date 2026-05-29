import { ref } from 'vue'

export function useAI() {
  const loading = ref(false)
  const error   = ref(null)

  async function generateExamples(word, language, nativeLanguage = 'en') {
    loading.value = true
    error.value   = null

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Generate 3 example sentences for the ${language} word "${word}".
Return ONLY a JSON array, no markdown, no explanation:
[
  {
    "sentence": "example sentence in ${language}",
    "translation": "translation in ${nativeLanguage}",
    "difficulty": "beginner|intermediate|advanced"
  }
]`,
          }],
        }),
      })

      const data = await response.json()
      const text = data.content?.[0]?.text ?? ''
      const clean = text.replace(/```json|```/g, '').trim()
      return JSON.parse(clean)
    } catch (e) {
      error.value = 'Failed to generate examples'
      return []
    } finally {
      loading.value = false
    }
  }

  async function generateDeck(topic, language, nativeLanguage = 'en', count = 10) {
    loading.value = true
    error.value   = null

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Create a vocabulary deck of ${count} words in ${language} about the topic: "${topic}".
Return ONLY a JSON array, no markdown, no explanation:
[
  {
    "word": "word in ${language}",
    "translation": "translation in ${nativeLanguage}",
    "example": "example sentence in ${language}",
    "notes": "optional grammar note or tip"
  }
]`,
          }],
        }),
      })

      const data = await response.json()
      const text = data.content?.[0]?.text ?? ''
      const clean = text.replace(/```json|```/g, '').trim()
      return JSON.parse(clean)
    } catch (e) {
      error.value = 'Failed to generate deck'
      return []
    } finally {
      loading.value = false
    }
  }

  async function explainWord(word, language, nativeLanguage = 'en') {
    loading.value = true
    error.value   = null

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Explain the ${language} word "${word}" for a language learner.
Return ONLY a JSON object, no markdown:
{
  "word": "${word}",
  "partOfSpeech": "noun/verb/etc",
  "definition": "clear definition in ${nativeLanguage}",
  "etymology": "brief etymology if interesting",
  "synonyms": ["synonym1", "synonym2"],
  "commonMistakes": "common mistake learners make",
  "memoryTip": "mnemonic or memory tip",
  "examples": [
    {"sentence": "...", "translation": "..."}
  ]
}`,
          }],
        }),
      })

      const data = await response.json()
      const text = data.content?.[0]?.text ?? ''
      const clean = text.replace(/```json|```/g, '').trim()
      return JSON.parse(clean)
    } catch (e) {
      error.value = 'Failed to explain word'
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, generateExamples, generateDeck, explainWord }
}