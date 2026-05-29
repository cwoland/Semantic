import { Router } from 'express'
import axios from 'axios'

const router = Router()

router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query
    if (!q) return res.status(400).json({ error: 'Missing query param: q' })

    const { data } = await axios.get('https://www.omdbapi.com/', {
      params: {
        s:       q,
        apikey:  process.env.OMDB_API_KEY,
        type:    'movie,series',
      },
    })

    if (data.Response === 'False') {
      return res.json({ results: [] })
    }

    res.json({ results: data.Search ?? [] })
  } catch (err) {
    next(err)
  }
})

export default router