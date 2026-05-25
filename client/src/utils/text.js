export function tokenize(text) {
  if (!text) return []
  return text.split(/(\s+)/).filter(Boolean).map((raw, i) => ({
    id:    i,
    raw,
    word:  raw.trim().replace(/[^a-zA-ZÀ-ÿ'-]/g, ''),
    isWord: /\S/.test(raw) && /[a-zA-ZÀ-ÿ]/.test(raw),
  }))
}

export function truncate(str, n = 80) {
  if (!str || str.length <= n) return str
  return str.slice(0, n).trimEnd() + '…'
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}