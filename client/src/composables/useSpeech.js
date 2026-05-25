import { ref, computed } from 'vue'

export function useSpeech() {
  const speaking  = ref(false)
  const supported = computed(() => 'speechSynthesis' in window)

  function speak(text, lang = 'en-US') {
    if (!supported.value || !text) return
    window.speechSynthesis.cancel()

    const utter  = new SpeechSynthesisUtterance(text)
    utter.lang   = lang
    utter.rate   = 0.9
    utter.pitch  = 1

    utter.onstart = () => { speaking.value = true  }
    utter.onend   = () => { speaking.value = false }
    utter.onerror = () => { speaking.value = false }

    window.speechSynthesis.speak(utter)
  }

  function stop() {
    window.speechSynthesis.cancel()
    speaking.value = false
  }

  const LANG_MAP = {
    it: 'it-IT', es: 'es-ES', fr: 'fr-FR',
    de: 'de-DE', ja: 'ja-JP', zh: 'zh-CN',
    pt: 'pt-BR', ru: 'ru-RU', ko: 'ko-KR',
    ar: 'ar-SA', en: 'en-US',
  }

  function langCode(iso) {
    return LANG_MAP[iso] ?? iso
  }

  return { speak, stop, speaking, supported, langCode }
}