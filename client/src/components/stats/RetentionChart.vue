<template>
  <div class="retention-chart">
    <div class="retention-chart__header">
      <span class="retention-chart__label text-muted">Retention over time</span>
      <span class="retention-chart__value">{{ overall }}%</span>
    </div>

    <div class="chart-area" ref="chartEl">
      <svg :viewBox="`0 0 ${W} ${H}`" class="chart-svg" aria-label="Retention chart">
        <line
          v-for="y in gridLines"
          :key="y"
          :x1="PAD" :y1="toY(y)"
          :x2="W - PAD" :y2="toY(y)"
          class="chart-grid"
        />

        <path :d="areaPath" class="chart-area-fill" />

        <path :d="linePath" class="chart-line" />

        <circle
          v-for="(p, i) in points"
          :key="i"
          :cx="p.x" :cy="p.y" r="3"
          class="chart-dot"
          :title="`${data[i]?.date}: ${data[i]?.correct}%`"
        />

        <text
          v-for="y in gridLines"
          :key="`lbl-${y}`"
          :x="PAD - 6" :y="toY(y) + 4"
          class="chart-tick"
          text-anchor="end"
        >{{ y }}%</text>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
})

const W = 400
const H = 120
const PAD = 36
const gridLines = [25, 50, 75, 100]

const overall = computed(() => {
  if (!props.data.length) return 0
  return Math.round(props.data.reduce((s, d) => s + d.correct, 0) / props.data.length)
})

const points = computed(() => {
  const d = props.data
  if (!d.length) return []
  return d.map((item, i) => ({
    x: PAD + (i / Math.max(d.length - 1, 1)) * (W - PAD * 2),
    y: toY(item.correct),
  }))
})

function toY(pct) {
  return PAD + (1 - pct / 100) * (H - PAD * 2)
}

const linePath = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
})

const areaPath = computed(() => {
  const pts = points.value
  if (!pts.length) return ''
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const last = pts[pts.length - 1]
  const first = pts[0]
  return `${line} L${last.x},${toY(0)} L${first.x},${toY(0)} Z`
})
</script>

<style scoped>
.retention-chart { display: flex; flex-direction: column; gap: var(--space-3); }

.retention-chart__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.retention-chart__value {
  font-size: var(--text-xl);
  font-weight: var(--weight-medium);
  color: var(--color-good);
  font-family: var(--font-mono);
}

.chart-area { width: 100%; }

.chart-svg { width: 100%; height: auto; overflow: visible; }

.chart-grid {
  stroke: var(--color-border);
  stroke-width: 1;
}

.chart-area-fill {
  fill: rgba(201, 168, 76, 0.08);
}

.chart-line {
  fill: none;
  stroke: var(--color-accent);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-dot {
  fill: var(--color-accent);
  stroke: var(--color-bg);
  stroke-width: 1.5;
}

.chart-tick {
  font-size: 9px;
  fill: var(--color-text-faint);
  font-family: var(--font-mono);
}
</style>