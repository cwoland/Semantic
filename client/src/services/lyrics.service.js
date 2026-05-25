import api from './api'

export async function fetchLyrics(artist, title) {
  try {
    const { data } = await api.get('/api/lyrics', {
      params: { artist, title },
    })
    return data.lyrics ?? null
  } catch {
    return null
  }
}