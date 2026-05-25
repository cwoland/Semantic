import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCommandPalette } from './useCommandPalette'

export function useKeyboard() {
  const router  = useRouter()
  const palette = useCommandPalette()

  let gPressed   = false
  let gTimer     = null

  const resetG = () => {
    gPressed = false
    clearTimeout(gTimer)
  }

  function onKeydown(e) {
    const tag = document.activeElement?.tagName
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)
      || document.activeElement?.isContentEditable

    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      palette.toggle()
      resetG()
      return
    }

    if (e.key === 'Escape') {
      if (palette.isOpen.value) {
        palette.close()
        resetG()
      }
      return
    }

    if (typing) return

    if (gPressed) {
      const map = {
        d: 'decks',
        s: 'decks',
        v: 'vocab',
        i: 'immersion',
        t: 'stats',
        h: 'dashboard',
      }
      if (map[e.key]) {
        e.preventDefault()
        router.push({ name: map[e.key] })
      }
      resetG()
      return
    }

    if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      gPressed = true
      gTimer = setTimeout(resetG, 1000)
    }
  }

  onMounted(()  => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
}