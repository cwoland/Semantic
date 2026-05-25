import { ref } from 'vue'
import { translate } from '@/services/translate.service'
import { lookupWord } from '@/services/dictionary.service'

export function useTranslate() {
  const result   = ref(null)
  const loading  = ref(false)
  const error    = ref(null)

  async function lookup(word, fromLang) {
    if (!word?.trim()) return
    loading.value = true
    error.value   = null
    result.value  = null

    try {
      const [dict, trans] = await Promise.all([
        lookupWord(word),
        translate(word, fromLang, 'en'),
      ])

      result.value = {
        word,
        definition:  dict?.definition   ?? '',
        example:     dict?.example      ?? '',
        phonetic:    dict?.phonetic      ?? '',
        audio:       dict?.audio         ?? null,
        translation: trans?.translation  ?? '',
        partOfSpeech: dict?.partOfSpeech ?? '',
      }
    } catch (e) {
      error.value = 'Could not fetch definition.'
    } finally {
      loading.value = false
    }
  }

  function clear() {
    result.value  = null
    error.value   = null
  }

  return { result, loading, error, lookup, clear }
}