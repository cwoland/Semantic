import { Router } from 'express'
import axios from 'axios'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const { artist, title } = req.query

    if (!artist || !title) {
      return res.status(400).json({ error: 'Missing params: artist, title' })
    }

    const { data } = await axios.get(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    )

    if (!data?.lyrics) {
      return res.status(404).json({ error: 'Lyrics not found' })
    }

    res.json({
      artist,
      title,
      lyrics: data.lyrics.trim(),
    })
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'Lyrics not found' })
    }
    next(err)
  }
})

export default router