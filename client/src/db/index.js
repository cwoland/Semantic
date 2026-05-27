import Dexie from 'dexie'

export const db = new Dexie('ObscuraDB')

db.version(1).stores({
  words:   '++id, deckId, status, language, nextReview, addedAt, sourceType',
  decks:   '++id, language, createdAt',
  phrases: '++id, language, sourceType, savedAt',
  sessions:'++id, deckId, startedAt, completedAt',
  stats:   '++id, date',
  settings:'key',
})

db.version(2).stores({
  words:   '++id, deckId, status, language, nextReview, addedAt, sourceType',
  decks:   '++id, language, createdAt',
  phrases: '++id, language, sourceType, savedAt',
  sessions:'++id, deckId, startedAt, completedAt',
  stats:   '++id, date',
  settings:'key',
  courses: '++id, language, level',
  units:   '++id, courseId, order',
  lessons: '++id, unitId, courseId, order',
  lessonProgress: '++id, lessonId, &[lessonId+userId]',
})

export default db