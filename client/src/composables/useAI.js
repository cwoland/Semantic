import { ref } from 'vue'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

async function callGemini(prompt) {
  const key = import.meta.env.VITE_GEMINI_KEY
  if (!key) throw new Error('No Gemini API key')

  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature:     0.7,
        maxOutputTokens: 1000,
      }
    })
  })

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return text.replace(/```json|```/g, '').trim()
}

export function useAI() {
  const loading = ref(false)
  const error   = ref(null)

async function generateDeck(topic, language, nativeLanguage = 'en', count = 10) {
  loading.value = true
  error.value   = null
  try {
    const text   = await callGemini(`...`)
    const result = safeParse(text)
    if (!result) throw new Error('Invalid JSON')
    return result
  } catch (e) {
    error.value = e.message
    return []
  } finally {
    loading.value = false
  }
}

async function generateExamples(word, language, nativeLanguage = 'en') {
  loading.value = true
  error.value   = null
  try {
    const text   = await callGemini(`...`)
    const result = safeParse(text)
    if (!result) throw new Error('Invalid JSON')
    return result
  } catch (e) {
    error.value = e.message
    return []
  } finally {
    loading.value = false
  }
  }

  async function explainWord(word, language, nativeLanguage = 'en') {
    loading.value = true
    error.value   = null
    try {
      const text = await callGemini(
        `Explain the ${language} word "${word}" for a language learner.
Return ONLY a JSON object:
{"word":"${word}","partOfSpeech":"...","definition":"...in ${nativeLanguage}","synonyms":["..."],"memoryTip":"...","examples":[{"sentence":"...","translation":"..."}]}`
      )
      return JSON.parse(text)
    } catch (e) {
      error.value = 'Failed to explain word'
      return null
    } finally {
      loading.value = false
    }
  }

  async function safeParse(text) {
  try {
    const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/)
    if (!match) throw new Error('No JSON found')
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

  return { loading, error, generateDeck, generateExamples, explainWord }
}