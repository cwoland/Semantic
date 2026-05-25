<template>
  <div class="heatmap">
    <div class="heatmap__months">
      <span v-for="m in monthLabels" :key="m.label + m.offset" :style="{ marginLeft: m.offset + 'px' }">
        {{ m.label }}
      </span>
    </div>

    <div class="heatmap__grid">
      <div class="heatmap__dow">
        <span>Mon</span>
        <span>Wed</span>
        <span>Fri</span>
      </div>

      <div class="heatmap__weeks">
        <div
          v-for="(week, wi) in weeks"
          :key="wi"
          class="heatmap__week"
        >
          <div
            v-for="day in week"
            :key="day.date"
            class="heatmap__cell"
            :class="day.date ? `heatmap__cell--l${day.level}` : 'heatmap__cell--empty'"
            :title="day.date ? `${day.date}: ${day.count} cards` : ''"
          />
        </div>
      </div>
    </div>

    <div class="heatmap__legend">
      <span class="text-faint">Less</span>
      <div v-for="l in [0,1,2,3,4]" :key="l" class="heatmap__cell" :class="`heatmap__cell--l${l}`" />
      <span class="text-faint">More</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
})

const weeks = computed(() => {
  const map = {}
  props.data.forEach(d => { map[d.date] = d })

  const today    = new Date()
  const startDay = new Date(today)
  startDay.setDate(today.getDate() - 364)
  // Rewind to Sunday
  startDay.setDate(startDay.getDate() - startDay.getDay())

  const allWeeks = []
  let current    = new Date(startDay)

  while (current <= today) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().slice(0, 10)
      const entry   = map[dateStr]
      week.push(current <= today
        ? { date: dateStr, count: entry?.count ?? 0, level: entry?.level ?? 0 }
        : { date: '', count: 0, level: 0 }
      )
      current.setDate(current.getDate() + 1)
    }
    allWeeks.push(week)
  }
  return allWeeks
})

const monthLabels = computed(() => {
  const labels = []
  let lastMonth = -1
  weeks.value.forEach((week, wi) => {
    const d = new Date(week[0].date)
    if (!week[0].date) return
    const m = d.getMonth()
    if (m !== lastMonth) {
      labels.push({
        label:  d.toLocaleString('en-US', { month: 'short' }),
        offset: wi * 14,
      })
      lastMonth = m
    }
  })
  return labels
})
</script>

<style scoped>
.heatmap { display: flex; flex-direction: column; gap: var(--space-2); }

.heatmap__months {
  display: flex;
  padding-left: 32px;
  font-size: 10px;
  color: var(--color-text-faint);
  position: relative;
  height: 16px;
}
.heatmap__months span { position: absolute; }

.heatmap__grid { display: flex; gap: var(--space-2); }

.heatmap__dow {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2px 0;
  font-size: 10px;
  color: var(--color-text-faint);
  min-width: 26px;
  height: calc(7 * 12px + 6 * 2px);
}

.heatmap__weeks { display: flex; gap: 2px; }

.heatmap__week {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.heatmap__cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: var(--color-surface-2);
  transition: opacity 140ms;
}
.heatmap__cell:hover { opacity: 0.7; }

.heatmap__cell--empty { background: transparent; }
.heatmap__cell--l0    { background: var(--color-surface-2); }
.heatmap__cell--l1    { background: rgba(201,168,76,0.25); }
.heatmap__cell--l2    { background: rgba(201,168,76,0.45); }
.heatmap__cell--l3    { background: rgba(201,168,76,0.70); }
.heatmap__cell--l4    { background: var(--color-accent); }

.heatmap__legend {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  justify-content: flex-end;
  font-size: 10px;
  color: var(--color-text-faint);
  margin-top: var(--space-1);
}
.heatmap__legend .heatmap__cell { cursor: default; }
.heatmap__legend .heatmap__cell:hover { opacity: 1; }
</style>