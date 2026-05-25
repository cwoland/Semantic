export function toDateStr(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function formatRelative(timestamp) {
  const diff = Date.now() - timestamp
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export function isToday(dateStr) {
  return dateStr === toDateStr()
}