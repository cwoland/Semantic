import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings.store'
import { getTranslations } from '@/i18n'

export function useI18n() {
    const settingsStore = useSettingsStore()

    const t = computed(() => {
        const locale = settingsStore.appLocale ?? 'en'
        const translations = getTranslations(locale)
        
        return new Proxy(translations, {
            get(target, key) {
                return target[key] ?? `[${String(key)}]`
            }
        })
    })

    return { t }
}