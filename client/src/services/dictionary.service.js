import api from './api'

export async function lookupWord(word) {
  try {
    const { data } = await api.get(`/api/dictionary/${encodeURIComponent(word)}`)
    return data
  } catch {
    return null
  }
}