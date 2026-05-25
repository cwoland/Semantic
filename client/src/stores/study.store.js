import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/db'
import { sm2 } from '@/utils/sm2'
import { useWordsStore } from './words.store'
import { useStreakStore } from './streak.store'
import { useStatsStore } from './stats.store'

export const useStudyStore = defineStore('study', () => {

    const wordsStore = useWordsStore()
    const streakStore = useStreakStore()
    const statsStore = useStatsStore()

    const session = ref(null)
    const queue = ref([])
    const pos = ref(0)
    const phase = ref('idle')
    const sessionLog = ref([])

    const currentCard = computed(() =>
    queue.value[pos.value] ?? null
    )

    const progress = computed(() => ({
        current: pos.value,
        total: queue.value.length,
        correct: sessionLog.value.filter(r => r.quality >= 3).length,
        incorrect: sessionLog.value.filter(r => r.quality < 3).length,
        percent: queue.value.length ? Math.round(pos.value / queue.value.length * 100) : 0,
    }))

    const isActive = computed(() => phase.value !== 'idle')
    const isDone = computed(() => phase.value === 'done')


    async function startSession(deckId) {
        const allWords = wordsStore.getWordsByDeck(deckId)
        const deck = (await db.decks.get(deckId))
        const { dailyNewLimit, dailyReviewLimit } = deck?.settings ?? { dailyNewLimit: 20, dailyReviewLimit: 100 }

        const dueReviews = allWords
        .filter(w => ['learning', 'review'].includes(w.status) && w.nextReview <= Date.now())
        .slice(0, dailyReviewLimit)

        const newWords = allWords
        .filter(w => w.status === 'new')
        .slice(0, dailyNewLimit)

        const combined = interleave(dueReviews, newWords)

        if (!combined.length) {
            phase.value = 'done'
            return false
        }

        session.value = {
            id: null, deckId,
            startedAt: Date.now(),
            completedAt: null,
        }

        queue.value = combined
        pos.value = 0
        sessionLog.value = []
        phase.value = 'question'
        return true
    }

    function revealAnswer() {
        if (phase.value === 'question') phase.value = 'answer'
    }

    async function submitAnswer(quality) {
        if (phase.value !== 'answer') return

        const card = currentCard.value
        if (!card) return

        const result = sm2(card, quality)

        await wordsStore.applyReview(card.id, result)

        sessionLog.value.push({ wordId: card.id, quality, timestamp: Date.now() })

        if (quality < 3) {
            queue.value.push({ ...card, ...result })
        }
        advance()
    }

    function advance() {
        pos.value += 1
        if (pos.value >= queue.value.length) {
            endSession()
        } else {
            phase.value = 'question'
        }
    }

    async function endSession() {
        phase.value = 'done'

        const summary = {
            deckId: session.value.deckId,
            startedAt: session.value.startedAt,
            completedAt: Date.now(),
            totalCards: sessionLog.value.length,
            correct: sessionLog.value.filter(r => r.quality >= 3).length,
            incorrect: sessionLog.value.filter(r => r.quality < 3).length,
            log: sessionLog.value,
        }
        const id = await db.sessions.add(summary)
        session.value = { ...session.value, id, completedAt: summary.completedAt }

        streakStore.recordActivity(summary)
        statsStore.recordSession(summary)
    }

    function resetSession() {
        session.value = null,
        queue.value = [],
        pos.value = 0,
        sessionLog.value = [],
        phase.value = 'idle'
    }

    function interleave(reviews, newCards) {
        if (!newCards.length) return reviews
        if (!reviews.length) return newCards

        const result = []
        const step = Math.max(Math.floor(reviews.length / newCards.length), 1)

        let ni = 0, ri = 0
        while (ri < reviews.length || ni < newCards.length) {
            for (let i = 0; i < step && re < reviews.length; i++) result.push(reviews[ri++])
                if (ni < newCards.length) result.push(newCards[ni++])
        }
        return result
    }

    return {
        session, queue, phase, sessionLog,
        currentCard, progress, isActive, isDone,
        startSession, revealAnswer, submitAnswer, resetSession,
    }
})