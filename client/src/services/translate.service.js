import api from './api'

export async function translate(text, from, to = 'en') {
  if (!text || !from || from === to) return null

  const fromCode = from.slice(0, 2).toLowerCase()
  const toCode   = to.slice(0, 2).toLowerCase()

  try {
    const { data } = await axios.get('/api/translate', {
      params: { q: text, from: fromCode, to: toCode },
    })
    return data
  } catch {
    return null
  }
}