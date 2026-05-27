import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import dictionaryRouter from './routes/dictionary.js'
import translateRouter  from './routes/translate.js'
import lyricsRouter     from './routes/lyrics.js'
import authRouter       from './routes/auth.js'
import usersRouter      from './routes/users.js'
import shareRouter      from './routes/share.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL ?? '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}))

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/dictionary', dictionaryRouter)
app.use('/api/translate',  translateRouter)
app.use('/api/lyrics',     lyricsRouter)
app.use('/api/auth',       authRouter)
app.use('/api/users',      usersRouter)
app.use('/api/share',      shareRouter)

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.path} not found` })
})

app.use(errorHandler)

export default app