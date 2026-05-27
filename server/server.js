import dotenv from 'dotenv'
dotenv.config()

import app from './src/app.js'
import { connectMongo } from './src/db/mongo.js'

const PORT = process.env.PORT ?? 3001

async function start() {
  await connectMongo()
  app.listen(PORT, () => {
    console.log(`Semantic API running on http://localhost:${PORT}`)
  })
}

start()