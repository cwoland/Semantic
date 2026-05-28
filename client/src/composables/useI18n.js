import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings.store'
import { getTranslations } from '@/i18n'

export function useI18n() {
    const settingsStore = useSettingsStore()

    const t = computed(() => {
        const locale = settingsStore.appLocale ?? 'en'
        return getTranslations(locale)

        return new Proxy(translations, {
            get(target, key) {
                return target[key] ?? `[${string(key)}]`
            }
        })
    })

    return { t }
}