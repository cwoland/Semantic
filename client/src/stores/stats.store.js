import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/db'

export const useStatsStore = defineStore('stats', () => {

  const dailyStats   = ref([])
  const sessions     = ref([])
  const loading      = ref(false)

  const retentionRate = computed(() => {
    const total   = sessions.value.reduce((s, r) => s + r.totalCards, 0)
    const correct = sessions.value.reduce((s, r) => s + r.correct,    0)
    return total ? Math.round(correct / total * 100) : 0
  })

  const avgCardsPerDay = computed(() => {
    const activeDays = dailyStats.value.filter(d => d.studied > 0)
    if (!activeDays.length) return 0
    const total = activeDays.reduce((s, d) => s + d.studied, 0)
    return Math.round(total / activeDays.length)
  })

  const totalStudyMinutes = computed(() =>
    Math.round(sessions.value.reduce((s, r) => s + (r.completedAt - r.startedAt), 0) / 60000)
  )

  const heatmapData = computed(() => {
    const map = {}
    dailyStats.value.forEach(d => { map[d.date] = d.studied })

    const days = []
    const today = new Date()
    for (let i = 364; i >= 0; i--) {
      const d    = new Date(today)
      d.setDate(d.getDate() - i)
      const key  = d.toISOString().slice(0, 10)
      const count = map[key] ?? 0
      days.push({
        date:  key,
        count,
        level: count === 0 ? 0 : count < 10 ? 1 : count < 25 ? 2 : count < 50 ? 3 : 4,
      })
    }
    return days
  })

  async function loadStats(days = 30) {
    loading.value = true
    const since = Date.now() - days * 24 * 60 * 60 * 1000
    sessions.value = await db.sessions
      .where('startedAt').above(since)
      .toArray()

    dailyStats.value = aggregateToDays(sessions.value)
    loading.value = false
  }

  function recordSession(session) {
    sessions.value.push(session)
    dailyStats.value = aggregateToDays(sessions.value)
  }

  function aggregateToDays(sessionList) {
    const byDay = {}
    sessionList.forEach(s => {
      const date = new Date(s.startedAt).toISOString().slice(0, 10)
      if (!byDay[date]) byDay[date] = { date, studied: 0, correct: 0, incorrect: 0, studyMs: 0 }
      byDay[date].studied   += s.totalCards
      byDay[date].correct   += s.correct
      byDay[date].incorrect += s.incorrect
      byDay[date].studyMs   += (s.completedAt - s.startedAt)
    })
    return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date))
  }

  return {
    dailyStats, sessions, loading,
    retentionRate, avgCardsPerDay, totalStudyMinutes, heatmapData,
    loadStats, recordSession,
  }
})