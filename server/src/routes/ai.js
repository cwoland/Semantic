import { Router } from 'express'
import axios from 'axios'

const router = Router()

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

async function callAnthropic(prompt, maxTokens = 1000) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const response = await axios.post(ANTHROPIC_API_URL, {
    model:      'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages: [{
      role: 'user',
      content: prompt,
    }],
  }, {
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
  })

  return response.data.content?.[0]?.text ?? ''
}

router.post('/generate-examples', async (req, res, next) => {
  try {
    const { word, language, nativeLanguage = 'en' } = req.body

    if (!word || !language) {
      return res.status(400).json({ error: 'Missing required fields: word, language' })
    }

    const prompt = `Generate 3 example sentences for the ${language} word "${word}".
Return ONLY a JSON array, no markdown, no explanation:
[
  {
    "sentence": "example sentence in ${language}",
    "translation": "translation in ${nativeLanguage}",
    "difficulty": "beginner|intermediate|advanced"
  }
]`

    const text = await callAnthropic(prompt)
    const clean = text.replace(/```json|```/g, '').trim()
    const examples = JSON.parse(clean)

    res.json({ examples })
  } catch (err) {
    next(err)
  }
})

router.post('/generate-deck', async (req, res, next) => {
  try {
    const { topic, language, nativeLanguage = 'en', count = 10 } = req.body

    if (!topic || !language) {
      return res.status(400).json({ error: 'Missing required fields: topic, language' })
    }

    const prompt = `Create a vocabulary deck of ${count} words in ${language} about the topic: "${topic}".
Return ONLY a JSON array, no markdown, no explanation:
[
  {
    "word": "word in ${language}",
    "translation": "translation in ${nativeLanguage}",
    "example": "example sentence in ${language}",
    "notes": "optional grammar note or tip"
  }
]`

    const text = await callAnthropic(prompt)
    const clean = text.replace(/```json|```/g, '').trim()
    const words = JSON.parse(clean)

    res.json({ words })
  } catch (err) {
    next(err)
  }
})

router.post('/explain-word', async (req, res, next) => {
  try {
    const { word, language, nativeLanguage = 'en' } = req.body

    if (!word || !language) {
      return res.status(400).json({ error: 'Missing required fields: word, language' })
    }

    const prompt = `Explain the ${language} word "${word}" for a language learner.
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
}`

    const text = await callAnthropic(prompt)
    const clean = text.replace(/```json|```/g, '').trim()
    const explanation = JSON.parse(clean)

    res.json({ explanation })
  } catch (err) {
    next(err)
  }
})

export default router
