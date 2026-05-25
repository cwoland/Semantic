import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/db'

const STORAGE_KEY = 'obscura_streak'

export const useStreakStore = defineStore('streak', () => {

  const currentStreak  = ref(0)
  const longestStreak  = ref(0)
  const lastStudyDate  = ref(null)
  const todayXP        = ref(0)
  const totalXP        = ref(0)
  const dailyGoalCards = ref(20)

  const todayGoalMet = computed(() => todayXP.value >= dailyGoalCards.value * 10)

  const todayProgressPercent = computed(() =>
    Math.min(100, Math.round(todayXP.value / (dailyGoalCards.value * 10) * 100))
  )

  const streakStatus = computed(() => {
    const today = toDateStr(new Date())
    const yesterday = toDateStr(new Date(Date.now() - 86400000))
    if (lastStudyDate.value === today)      return 'active'
    if (lastStudyDate.value === yesterday)  return 'at-risk'  // studied yesterday, not yet today
    return 'broken'
  })

  async function loadStreak() {
    const saved = await db.settings.get(STORAGE_KEY)
    if (!saved) return

    const data = saved.value
    currentStreak.value  = data.currentStreak  ?? 0
    longestStreak.value  = data.longestStreak  ?? 0
    lastStudyDate.value  = data.lastStudyDate  ?? null
    todayXP.value        = data.todayXP        ?? 0
    totalXP.value        = data.totalXP        ?? 0
    dailyGoalCards.value = data.dailyGoalCards ?? 20

    if (data.lastXpDate !== toDateStr(new Date())) {
      todayXP.value = 0
    }
  }

  function recordActivity(session) {
    const xpGained = calcXP(session)
    todayXP.value  += xpGained
    totalXP.value  += xpGained

    const today = toDateStr(new Date())
    const yesterday = toDateStr(new Date(Date.now() - 86400000))

    if (lastStudyDate.value === today) {
    } else if (lastStudyDate.value === yesterday) {
      currentStreak.value += 1
      longestStreak.value = Math.max(longestStreak.value, currentStreak.value)
    } else {
      currentStreak.value = 1
    }

    lastStudyDate.value = today
    persist()
  }

  function setDailyGoal(cards) {
    dailyGoalCards.value = cards
    persist()
  }

  function calcXP({ correct, incorrect }) {
    const base = correct * 10 + incorrect * 2
    const multiplier = currentStreak.value >= 7  ? 1.5
                     : currentStreak.value >= 3  ? 1.2
                     : 1
    return Math.round(base * multiplier)
  }

  function toDateStr(date) {
    return date.toISOString().slice(0, 10)
  }

  async function persist() {
    await db.settings.put({
      key: STORAGE_KEY,
      value: {
        currentStreak:  currentStreak.value,
        longestStreak:  longestStreak.value,
        lastStudyDate:  lastStudyDate.value,
        lastXpDate:     toDateStr(new Date()),
        todayXP:        todayXP.value,
        totalXP:        totalXP.value,
        dailyGoalCards: dailyGoalCards.value,
      },
    })
  }

  return {
    currentStreak, longestStreak, lastStudyDate,
    todayXP, totalXP, dailyGoalCards,
    todayGoalMet, todayProgressPercent, streakStatus,
    loadStreak, recordActivity, setDailyGoal,
  }
})