import { ref, computed, readonly } from 'vue'
import { useRouter } from 'vue-router'

const isOpen  = ref(false)
const query   = ref('')
const activeIdx = ref(0)


function buildCommands(router) {
  return [
    {
      id: 'go-dashboard',
      label: 'Go to Dashboard',
      icon: 'ti-layout-dashboard',
      keywords: ['home', 'dashboard', 'overview'],
      action: () => router.push({ name: 'dashboard' }),
    },
    {
      id: 'go-study',
      label: 'Start studying',
      icon: 'ti-cards',
      keywords: ['study', 'learn', 'flashcard', 'review'],
      action: () => router.push({ name: 'decks' }),
    },
    {
      id: 'go-decks',
      label: 'Go to Decks',
      icon: 'ti-stack-2',
      keywords: ['decks', 'collections'],
      action: () => router.push({ name: 'decks' }),
    },
    {
      id: 'go-vocab',
      label: 'Go to Vocabulary',
      icon: 'ti-book-2',
      keywords: ['vocab', 'vocabulary', 'words', 'phrases'],
      action: () => router.push({ name: 'vocab' }),
    },
    {
      id: 'go-immersion',
      label: 'Open Immersion',
      icon: 'ti-eye',
      keywords: ['immersion', 'reader', 'music', 'movie', 'lyrics'],
      action: () => router.push({ name: 'immersion' }),
    },
    {
      id: 'go-stats',
      label: 'View Statistics',
      icon: 'ti-chart-line',
      keywords: ['stats', 'statistics', 'progress', 'streak', 'heatmap'],
      action: () => router.push({ name: 'stats' }),
    },
    {
      id: 'go-settings',
      label: 'Open Settings',
      icon: 'ti-settings',
      keywords: ['settings', 'preferences', 'language', 'theme'],
      action: () => router.push({ name: 'settings' }),
    },
  ]
}

export function useCommandPalette() {
  const router   = useRouter()
  const commands = buildCommands(router)

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return commands

    return commands.filter(cmd => {
      const haystack = [cmd.label, ...(cmd.keywords ?? [])].join(' ').toLowerCase()
      return haystack.includes(q)
    })
  })

  const activeCommand = computed(() => filtered.value[activeIdx.value] ?? null)

  function open() {
    isOpen.value  = true
    query.value   = ''
    activeIdx.value = 0
  }

  function close() {
    isOpen.value = false
    query.value  = ''
  }

  function toggle() {
    isOpen.value ? close() : open()
  }

  function moveUp() {
    activeIdx.value = Math.max(0, activeIdx.value - 1)
  }

  function moveDown() {
    activeIdx.value = Math.min(filtered.value.length - 1, activeIdx.value + 1)
  }

  function confirm() {
    const cmd = activeCommand.value
    if (!cmd) return
    cmd.action()
    close()
  }

  function onQueryChange() {
    activeIdx.value = 0
  }

  return {
    isOpen:  readonly(isOpen),
    query,
    filtered,
    activeIdx,
    activeCommand,
    open, close, toggle,
    moveUp, moveDown, confirm,
    onQueryChange,
  }
}