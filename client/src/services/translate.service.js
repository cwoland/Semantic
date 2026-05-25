import api from './api'

export async function translate(text, from, to = 'en') {
  try {
    const { data } = await api.get('/api/translate', {
      params: { q: text, from, to },
    })
    return data
  } catch {
    return null
  }
}