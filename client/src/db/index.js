import Dexie from 'dexie'

export const db = new Dexie('SemanticDB')

db.version(1).stores({
  words:   '++id, deckId, status, language, nextReview, addedAt, sourceType',
  decks:   '++id, language, createdAt',
  phrases: '++id, language, sourceType, savedAt',
  sessions:'++id, deckId, startedAt, completedAt',
  stats:   '++id, date',
  settings:'key',
})

export default db