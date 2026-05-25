import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

const DURATION = {
  success: 3000,
  error:   5000,
  info:    3500,
  warning: 4000,
}

function add(message, type = 'info', options = {}) {
  const id       = ++nextId
  const duration = options.duration ?? DURATION[type] ?? 3000

  toasts.value.push({ id, message, type, duration })

  if (duration > 0) {
    setTimeout(() => remove(id), duration)
  }

  return id
}

function remove(id) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

export function useToast() {
  return {
    toasts,
    success: (msg, opts) => add(msg, 'success', opts),
    error:   (msg, opts) => add(msg, 'error',   opts),
    info:    (msg, opts) => add(msg, 'info',     opts),
    warning: (msg, opts) => add(msg, 'warning',  opts),
    remove,
  }
}