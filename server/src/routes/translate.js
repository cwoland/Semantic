import { Router } from 'express'
import axios from 'axios'

const router = Router()

router.get('/', async (req, res, next) => {
    try {
        const { q, from = 'it', to = 'en'} = req.query

        if (!q) return res.status(400).json({ error: 'Missing query param: q' })

        const { data } = await axios.get('https://api.mymemory.translated.net/get', {
            params: { q, lanpair: `${from}|${to}`},
        })

        const match = data?.responseData
        if (!match?.translatedText) {
            return res.status(404).json({ error: 'No translation found' })
        }

        res.json({
            translation: match.translatedText,
            confidence: Math.round((match.match ?? 0) * 100),
            from,
            to,
        })
    } catch (err) {
        next (err)
    }
})

export default router