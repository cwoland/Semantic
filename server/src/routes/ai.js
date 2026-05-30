import { Router } from 'express'
import axios from 'axios'

const router = Router()

router.post('/generate-deck', async (req, res, next) => {
  try {
    const { topic, language, nativeLanguage = 'en', count = 10 } = req.body

    if (!topic || !language) {
      return res.status(400).json({ error: 'Missing topic or language' })
    }

    const prompt = `Create a vocabulary deck of ${count} words in ${language} about: "${topic}".
Return ONLY a JSON array, no markdown, no explanation:
[{"word":"...","translation":"...in ${nativeLanguage}","example":"...","notes":"..."}]`

    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
      }
    )

    const text  = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const clean = text.replace(/```json|```/g, '').trim()
    const match = clean.match(/\[[\s\S]*\]/)
    if (!match) return res.status(500).json({ error: 'Invalid AI response' })

    const words = JSON.parse(match[0])
    res.json({ words })
  } catch (err) {
    console.error('AI error:', err.message)
    next(err)
  }
})

router.post('/explain-word', async (req, res, next) => {
  try {
    const { word, language, nativeLanguage = 'en' } = req.body

    const prompt = `Explain the ${language} word "${word}" for a language learner.
Return ONLY a JSON object, no markdown:
{"word":"${word}","partOfSpeech":"...","definition":"...in ${nativeLanguage}","synonyms":["..."],"memoryTip":"...","examples":[{"sentence":"...","translation":"..."}]}`

    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
      }
    )

    const text  = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const clean = text.replace(/```json|```/g, '').trim()
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) return res.status(500).json({ error: 'Invalid AI response' })

    res.json(JSON.parse(match[0]))
  } catch (err) {
    next(err)
  }
})

export default router