import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { db } from '@/db'

const SETTINGS_KEY = 'obscura_settings'

export const useSettingsStore = defineStore('settings', () => {

  const theme          = ref('dark')
  const targetLanguage = ref('it')
  const nativeLanguage = ref('en')
  const dailyGoal      = ref(20)
  const notifications  = ref(true)
  const offlineMode    = ref(true)
  const autoPlayAudio  = ref(false)

  const shortcuts = ref({
    showAnswer:   'Space',
    rateAgain:    '1',
    rateHard:     '2',
    rateGood:     '3',
    rateEasy:     '4',
    openCommand:  'Meta+k',
    goStudy:      'g s',
    goDecks:      'g d',
    goStats:      'g t',
    goImmersion:  'g i',
  })

  async function loadSettings() {
    const saved = await db.settings.get(SETTINGS_KEY)
    if (!saved) return
    Object.entries(saved.value).forEach(([k, v]) => {
      if (k === 'shortcuts') Object.assign(shortcuts.value, v)
      else if (k in { theme:1, targetLanguage:1, nativeLanguage:1,
                      dailyGoal:1, notifications:1, offlineMode:1, autoPlayAudio:1 }) {
        eval(`${k}.value = v`)
      }
    })
  }

  async function save() {
    await db.settings.put({
      key: SETTINGS_KEY,
      value: {
        theme:          theme.value,
        targetLanguage: targetLanguage.value,
        nativeLanguage: nativeLanguage.value,
        dailyGoal:      dailyGoal.value,
        notifications:  notifications.value,
        offlineMode:    offlineMode.value,
        autoPlayAudio:  autoPlayAudio.value,
        shortcuts:      shortcuts.value,
      },
    })
  }

  watch(
    [theme, targetLanguage, nativeLanguage, dailyGoal, notifications, offlineMode, autoPlayAudio, shortcuts],
    () => save(),
    { deep: true }
  )

  return {
    theme, targetLanguage, nativeLanguage,
    dailyGoal, notifications, offlineMode, autoPlayAudio, shortcuts,
    loadSettings, save,
  }
})