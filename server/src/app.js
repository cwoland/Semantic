import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import dictionaryRouter from './routes/dictionary.js'
import translateRouter from './routes/translate.js'
import lyricsRouter from './routes/lyrics.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL ?? '*',
    methods: ['GET'],
}))

app.use(express.json())

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/dictionary', dictionaryRouter)
app.use('/api/translate', translateRouter)
app.use('/api/lyrics', lyricsRouter)

app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.path} not found.` })
})

app.use(errorHandler)

export default app