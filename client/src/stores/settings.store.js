import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { db } from '@/db'

const SETTINGS_KEY = 'obscura_settings'

export const useSettingsStore = defineStore('settings', () => {

  const theme          = ref('dark')
  const targetLanguage = ref('')
  const nativeLanguage = ref('')
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

  const d = saved.value
  if (d.theme          !== undefined) theme.value          = d.theme
  if (d.targetLanguage !== undefined) targetLanguage.value = d.targetLanguage
  if (d.nativeLanguage !== undefined) nativeLanguage.value = d.nativeLanguage
  if (d.dailyGoal      !== undefined) dailyGoal.value      = d.dailyGoal
  if (d.notifications  !== undefined) notifications.value  = d.notifications
  if (d.offlineMode    !== undefined) offlineMode.value    = d.offlineMode
  if (d.autoPlayAudio  !== undefined) autoPlayAudio.value  = d.autoPlayAudio
  if (d.shortcuts      !== undefined) shortcuts.value      = { ...d.shortcuts }
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
      shortcuts: { ...shortcuts.value },
    },
  })
}

watch(
  [theme, targetLanguage, nativeLanguage, dailyGoal,
   notifications, offlineMode, autoPlayAudio],
  () => save(),
  { deep: false }
)

watch(
  () => ({ ...shortcuts.value }),
  () => save(),
)

const _loaded = ref(false)

async function loadSettings() {
  const saved = await db.settings.get(SETTINGS_KEY)
  if (!saved) {
    _loaded.value = true
    return
  }
  const d = saved.value
  if (d.theme          !== undefined) theme.value          = d.theme
  if (d.targetLanguage !== undefined) targetLanguage.value = d.targetLanguage
  if (d.nativeLanguage !== undefined) nativeLanguage.value = d.nativeLanguage
  if (d.dailyGoal      !== undefined) dailyGoal.value      = d.dailyGoal
  if (d.notifications  !== undefined) notifications.value  = d.notifications
  if (d.offlineMode    !== undefined) offlineMode.value    = d.offlineMode
  if (d.autoPlayAudio  !== undefined) autoPlayAudio.value  = d.autoPlayAudio
  if (d.shortcuts      !== undefined) shortcuts.value      = { ...d.shortcuts }
  _loaded.value = true
}

  return {
    theme, targetLanguage, nativeLanguage,
    dailyGoal, notifications, offlineMode, autoPlayAudio, shortcuts,
    loadSettings, save,
    _loaded,
    theme, targetLanguage, nativeLanguage,
  }
})