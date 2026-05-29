<template>
  <div class="rating-bar" role="group" aria-label="Rate your recall">
    <button
      v-for="btn in buttons"
      :key="btn.quality"
      class="rating-btn"
      :class="`rating-btn--${btn.key}`"
      @click="$emit('rate', btn.quality)"
    >
      <kbd class="rating-btn__key">{{ btn.quality }}</kbd>
      <span class="rating-btn__label">{{ btn.label }}</span>
      <span class="rating-btn__next">{{ btn.next }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { sm2, daysUntilReview } from '@/utils/sm2'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const props = defineProps({
  card: { type: Object, required: true },
})

defineEmits(['rate'])

const buttons = computed(() => {
  const ratings = [
    { quality: 1, key: 'again', label: t.value.study_again },
    { quality: 2, key: 'hard',  label: t.value.study_hard  },
    { quality: 4, key: 'good',  label: t.value.study_good  },
    { quality: 5, key: 'easy',  label: t.value.study_easy  },
  ]

  return ratings.map(r => {
    const result = sm2(props.card, r.quality)
    const days   = Math.ceil((result.nextReview - Date.now()) / 86400000)
    let next
    if (r.quality < 3) {
      next = '~10m'
    } else if (days <= 0) {
      next = 'today'
    } else if (days === 1) {
      next = '1d'
    } else if (days < 7) {
      next = `${days}d`
    } else if (days < 30) {
      next = `${Math.round(days / 7)}w`
    } else {
      next = `${Math.round(days / 30)}mo`
    }
    return { ...r, next }
  })
})
</script>

<style scoped>
.rating-bar {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

.rating-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease, transform 80ms ease;
  min-width: 76px;
}

.rating-btn:hover  { transform: translateY(-2px); }
.rating-btn:active { transform: translateY(0) scale(0.98); }

.rating-btn__key {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.rating-btn__label {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
}

.rating-btn__next {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--color-text-faint);
}

.rating-btn--again { border-color: rgba(192, 57, 43, 0.25); }
.rating-btn--again:hover { background: rgba(192, 57, 43, 0.07); border-color: rgba(192, 57, 43, 0.45); }
.rating-btn--again .rating-btn__label { color: var(--color-again); }

.rating-btn--hard { border-color: rgba(230, 126, 34, 0.25); }
.rating-btn--hard:hover { background: rgba(230, 126, 34, 0.07); border-color: rgba(230, 126, 34, 0.45); }
.rating-btn--hard .rating-btn__label { color: var(--color-hard); }

.rating-btn--good { border-color: rgba(39, 174, 96, 0.25); }
.rating-btn--good:hover { background: rgba(39, 174, 96, 0.07); border-color: rgba(39, 174, 96, 0.45); }
.rating-btn--good .rating-btn__label { color: var(--color-good); }

.rating-btn--easy { border-color: rgba(201, 168, 76, 0.25); }
.rating-btn--easy:hover { background: rgba(201, 168, 76, 0.07); border-color: rgba(201, 168, 76, 0.45); }
.rating-btn--easy .rating-btn__label { color: var(--color-easy); }
</style>