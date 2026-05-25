import dotenv from 'dotenv'
dotenv.config()

import app from './src/app.js'

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () => {
    console.log(`Semantic API running on http://localhost:${PORT}`)
    console.log(`Health: http://localhost:${PORT}/health`)
})