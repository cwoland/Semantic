<template>
  <div class="onboarding">
    <div class="onboarding__card">

      <div class="app-lang-row">
        <button
          v-for="loc in LOCALES"
          :key="loc.code"
          class="app-lang-btn"
          :class="{ 'app-lang-btn--active': appLocale === loc.code }"
          @click="setAppLocale(loc.code)"
        >
          {{ loc.flag }} {{ loc.name }}
        </button>
      </div>

      <h1 class="onboarding__title">{{ t.onboarding_title }}</h1>
      <p class="onboarding__sub">{{ t.onboarding_sub }}</p>

      <div class="lang-grid">
        <button
          v-for="lang in LANGUAGES"
          :key="lang.code"
          class="lang-btn"
          :class="{ 'lang-btn--active': selected === lang.code }"
          @click="selected = lang.code"
        >
          <span class="lang-btn__flag">{{ lang.flag }}</span>
          <span class="lang-btn__name">{{ lang.name }}</span>
          <span class="lang-btn__native">{{ lang.native }}</span>
        </button>
      </div>

      <div class="onboarding__native">
        <label class="form-label">{{ t.onboarding_native }}</label>
        <select v-model="nativeLang" class="form-select">
          <option v-for="l in LANGUAGES" :key="l.code" :value="l.code">
            {{ l.flag }} {{ l.name }}
          </option>
        </select>
      </div>

      <button
        class="onboarding__cta"
        :disabled="!selected"
        @click="confirm"
      >
        {{ t.onboarding_cta }} {{ selectedLang?.name }}
        <i class="ti ti-arrow-right" />
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings.store'
import { useI18n } from '@/composables/useI18n'
import { LOCALES, getTranslations } from '@/i18n'
import { COURSE_TEMPLATES } from '@/data/courses'

const router        = useRouter()
const settingsStore = useSettingsStore()
const { t }         = useI18n()

const selected   = ref('')
const nativeLang = ref('en')
const appLocale  = ref(settingsStore.appLocale ?? 'en')

const LANGUAGES = [
  { code: 'it', name: 'Italian',    native: 'Italiano',   flag: '🇮🇹' },
  { code: 'es', name: 'Spanish',    native: 'Español',    flag: '🇪🇸' },
  { code: 'fr', name: 'French',     native: 'Français',   flag: '🇫🇷' },
  { code: 'de', name: 'German',     native: 'Deutsch',    flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese',   native: '日本語',      flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese',    native: '中文',        flag: '🇨🇳' },
  { code: 'pt', name: 'Portuguese', native: 'Português',  flag: '🇧🇷' },
  { code: 'ru', name: 'Russian',    native: 'Русский',    flag: '🇷🇺' },
  { code: 'ko', name: 'Korean',     native: '한국어',      flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic',     native: 'العربية',    flag: '🇸🇦' },
  { code: 'en', name: 'English',    native: 'English',    flag: '🇬🇧' },
]

const selectedLang = computed(() =>
  LANGUAGES.find(l => l.code === selected.value)
)

function setAppLocale(code) {
  appLocale.value = code
  settingsStore.appLocale = code
  settingsStore.save()
}

async function confirm() {
  if (!selected.value) return
  settingsStore.targetLanguage = selected.value
  settingsStore.nativeLanguage = nativeLang.value
  settingsStore.appLocale      = appLocale.value
  await settingsStore.save()

  const templates = COURSE_TEMPLATES.map(t => t.language)
  router.push({
    name: templates.includes(selected.value) ? 'course' : 'dashboard'
  })
}
</script>

<style scoped>

.app-lang-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  justify-content: center;
  margin-bottom: var(--space-2);
}

.app-lang-btn {
  padding: 4px var(--space-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: none;
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  cursor: pointer;
  transition: all 140ms;
}

.app-lang-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-text-muted);
}

.app-lang-btn--active {
  border-color: var(--color-accent);
  background: var(--color-accent-faint);
  color: var(--color-accent);
}

.onboarding {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: var(--space-6);
}

.onboarding__card {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  padding: var(--space-10) var(--space-8);
  box-shadow: 0 8px 32px rgba(124, 79, 190, 0.08);
}

.onboarding__title {
  font-size: var(--text-2xl);
  text-align: center;
  letter-spacing: -0.02em;
}

.onboarding__sub {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin-top: calc(-1 * var(--space-4));
}

.lang-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.lang-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-3) var(--space-2);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  cursor: pointer;
  transition: border-color 160ms, background 160ms, transform 120ms;
}

.lang-btn:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-faint);
  transform: translateY(-1px);
}

.lang-btn--active {
  border-color: var(--color-accent);
  background: var(--color-accent-faint);
  box-shadow: 0 0 0 2px rgba(124, 79, 190, 0.2);
}

.lang-btn__flag  { font-size: 24px; line-height: 1; }
.lang-btn__name  { font-size: var(--text-xs); font-weight: 500; color: var(--color-text); }
.lang-btn__native{ font-size: 10px; color: var(--color-text-faint); }

.onboarding__native {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.form-select {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
  cursor: pointer;
  appearance: none;
  transition: border-color 140ms;
}
.form-select:focus { border-color: var(--color-accent); }

.onboarding__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  transition: background 160ms, opacity 160ms, transform 120ms;
}
.onboarding__cta:hover:not(:disabled) {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
}
.onboarding__cta:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>