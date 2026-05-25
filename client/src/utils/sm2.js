const ONE_DAY_MS = 24 * 60 * 1000

export function sm2(card, quality) {
    let { interval, repetitions, easeFactor } = card

    if (quality < 3) {
        repetitions = 0
        interval = 1
    } else {
        if (repetitions === 0) interval = 1
        else if (repetitions === 1) interval = 6
        else interval = Math.round(interval * easeFactor)
        repetitions += 1
    }

    easeFactor = Math.max(
        1.3,
        easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    )

    const nextReview = Date.now() + interval * ONE_DAY_MS

    const status =
    quality < 3 ? 'learning'
    : repetitions >= 5 ? 'known'
    : repetitions >= 2 ? 'review'
    : 'learning'

    return { interval, repetitions, easeFactor, nextReview, status }
}

export function daysUntilReview(nextReview) {
    return Math.ceil((nextReview - Date.now()) / ONE_DAY_MS)
}

export function isDue(card) {
    return card.nextReview <= Date.now() && card.status !== 'known'
}