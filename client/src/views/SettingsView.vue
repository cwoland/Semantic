<template>
  <div class="settings-view">

    <header class="page-header">
      <h1 class="page-title">{{t.settings_title}}</h1>
    </header>

    <section class="settings-section">
      <h2 class="settings-section__title">{{t.settings_language}}</h2>

      <div class="settings-card">
        <div class="setting-row">
          <div class="setting-row__info">
            <span class="setting-row__label">{{t.settings_learning}}</span>
            <span class="setting-row__desc">{{ t.settings_learning_desc }}</span>
          </div>
          <select
            class="setting-select"
            v-model="settingsStore.targetLanguage"
            @change="settingsStore.save()"
          >
            <option v-for="l in LANGUAGES" :key="l.code" :value="l.code">
              {{ l.flag }} {{ l.name }}
            </option>
          </select>
        </div>

        <div class="setting-divider" />

        <div class="setting-row">
            <div class="setting-row__info">
              <span class="setting-row__label">{{ t.settings_app_lang }}</span>
              <span class="setting-row__desc">{{ t.settings_app_lang_desc }}</span>
            </div>
            <select
            class="setting-select"
            v-model="settingsStore.appLocale"
            @change="settingsStore.save()"
            >
            <option v-for="l in LOCALES" :key="l.code" :value="l.code">
            {{ l.flag }} {{ l.name }}
            </option>
            </select>
        </div>
      </div>
    </section>

    <section class="settings-section">
      <h2 class="settings-section__title">{{ t.settings_appearance }}</h2>

      <div class="settings-card">
        <div class="setting-row">
          <div class="setting-row__info">
            <span class="setting-row__label">{{t.settings_theme}}</span>
            <span class="setting-row__desc">{{t.settings_theme_desc}}</span>
          </div>
          <div class="theme-toggle">
            <button
              v-for="t in themes"
              :key="t.value"
              class="theme-btn"
              :class="{ 'theme-btn--active': settingsStore.theme === t.value }"
              @click="setTheme(t.value)"
            >
              <i :class="['ti', t.icon]" />
              {{ t.label }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="settings-section">
      <h2 class="settings-section__title">{{t.settings_study}}</h2>

      <div class="settings-card">
        <div class="setting-row">
          <div class="setting-row__info">
            <span class="setting-row__label">{{t.settings_daily_goal}}</span>
            <span class="setting-row__desc">{{t.settings_daily_desc}}</span>
          </div>
          <div class="number-input">
            <button class="number-btn" @click="changeGoal(-5)">−</button>
            <span class="number-value">{{ settingsStore.dailyGoal }}</span>
            <button class="number-btn" @click="changeGoal(5)">+</button>
          </div>
        </div>

        <div class="setting-divider" />

        <div class="setting-row">
          <div class="setting-row__info">
            <span class="setting-row__label">{{t.settings_audio}}</span>
            <span class="setting-row__desc">{{t.settings_audio_desc}}</span>
          </div>
          <button
            class="toggle"
            :class="{ 'toggle--on': settingsStore.autoPlayAudio }"
            @click="toggleAutoPlay"
            :aria-pressed="settingsStore.autoPlayAudio"
            aria-label="Auto-play audio"
          >
            <span class="toggle__thumb" />
          </button>
        </div>

        <div class="setting-divider" />

        <div class="setting-row">
          <div class="setting-row__info">
            <span class="setting-row__label">{{t.settings_offline}}</span>
            <span class="setting-row__desc">{{t.settings_offline_desc}}</span>
          </div>
          <button
            class="toggle"
            :class="{ 'toggle--on': settingsStore.offlineMode }"
            @click="toggleOffline"
            :aria-pressed="settingsStore.offlineMode"
            aria-label="Offline mode"
          >
            <span class="toggle__thumb" />
          </button>
        </div>
      </div>
    </section>
    <section class="settings-section">
      <h2 class="settings-section__title">{{t.settings_shortcuts}}</h2>

      <div class="settings-card shortcuts-card">
        <div class="shortcut-row" v-for="s in shortcuts" :key="s.label">
          <span class="shortcut-row__label">{{ s.label }}</span>
          <kbd>{{ s.key }}</kbd>
        </div>
      </div>
    </section>
    <section class="settings-section">
      <h2 class="settings-section__title">{{t.settings_data}}</h2>

      <div class="settings-card">
        <div class="setting-row">
          <div class="setting-row__info">
            <span class="setting-row__label">{{ t.settings_reset_lang }}</span>
            <span class="setting-row__desc">{{t.settings_reset_desc}}</span>
          </div>
          <button class="btn btn--ghost" @click="resetLanguage">
            {{t.settings_reset}}
          </button>
        </div>

        <div class="setting-divider" />

        <div class="setting-row">
          <div class="setting-row__info">
            <span class="setting-row__label danger-text">{{t.settings_clear}}</span>
            <span class="setting-row__desc">{{t.settings_clear_desc}}</span>
          </div>
          <button class="btn btn--danger" @click="clearData">
            {{t.settings_clear_btn}}
          </button>
        </div>
      </div>
    </section>
    <section class="settings-section">
      <div class="settings-card about-card">
        <p class="about-title">Semantic</p>
        <p class="text-faint" style="font-size: var(--text-xs)">
          {{ t.auth_sub }}
        </p>
        <p class="text-faint" style="font-size: var(--text-xs); margin-top: var(--space-1)">
          v0.1.0
        </p>
      </div>
    </section>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings.store'
import { useToast }         from '@/composables/useToast'
import { db }               from '@/db'
import { LOCALES }          from '@/i18n'
import { useI18n } from 'useI18n'

const router        = useRouter()
const settingsStore = useSettingsStore()
const toast         = useToast()
const { t }         = useI18n()

const LANGUAGES = [
  { code: 'it', name: 'Italian',    flag: '🇮🇹' },
  { code: 'es', name: 'Spanish',    flag: '🇪🇸' },
  { code: 'fr', name: 'French',     flag: '🇫🇷' },
  { code: 'de', name: 'German',     flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese',   flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese',    flag: '🇨🇳' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian',    flag: '🇷🇺' },
  { code: 'ko', name: 'Korean',     flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic',     flag: '🇸🇦' },
  { code: 'en', name: 'English',    flag: '🇬🇧' },
]

const themes = [
  { value: 'light',  label: 'Light',  icon: 'ti-sun'    },
  { value: 'dark',   label: 'Dark',   icon: 'ti-moon'   },
  { value: 'system', label: 'System', icon: 'ti-device-laptop' },
]

const shortcuts = [
  { label: 'Command palette', key: '⌘ K' },
  { label: 'Reveal answer',   key: 'Space' },
  { label: 'Again',           key: '1' },
  { label: 'Hard',            key: '2' },
  { label: 'Good',            key: '3' },
  { label: 'Easy',            key: '4' },
  { label: 'Go to Dashboard', key: 'g h' },
  { label: 'Go to Decks',     key: 'g d' },
  { label: 'Go to Vocab',     key: 'g v' },
  { label: 'Go to Immersion', key: 'g i' },
  { label: 'Go to Stats',     key: 'g t' },
  { label: 'Go to Course',    key: 'g c' },
]

function setTheme(value) {
  settingsStore.theme = value
  applyTheme(value)
  settingsStore.save()
}

function applyTheme(value) {
  const root = document.documentElement
  if (value === 'dark') {
    root.classList.add('theme-dark')
    root.classList.remove('theme-light')
  } else if (value === 'light') {
    root.classList.add('theme-light')
    root.classList.remove('theme-dark')
  } else {
    root.classList.remove('theme-dark', 'theme-light')
  }
}

function changeGoal(delta) {
  const newVal = Math.max(5, Math.min(200, settingsStore.dailyGoal + delta))
  settingsStore.dailyGoal = newVal
  settingsStore.save()
}

function toggleAutoPlay() {
  settingsStore.autoPlayAudio = !settingsStore.autoPlayAudio
  settingsStore.save()
}

function toggleOffline() {
  settingsStore.offlineMode = !settingsStore.offlineMode
  settingsStore.save()
}

async function resetLanguage() {
  settingsStore.targetLanguage = ''
  await settingsStore.save()
  router.push({ name: 'onboarding' })
}

async function clearData() {
  if (!confirm('Delete ALL words, decks, streaks and progress? This cannot be undone.')) return
  await db.delete()
  await db.open()
  toast.success('All data cleared')
  settingsStore.targetLanguage = ''
  await settingsStore.save()
  router.push({ name: 'onboarding' })
}
</script>

<style scoped>
.settings-view {
  padding: var(--space-8);
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.page-title { font-size: var(--text-2xl); letter-spacing: -0.02em; }

.settings-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.settings-section__title {
  font-size: var(--text-xs);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-faint);
  font-family: var(--font-mono);
}

.settings-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
}

.setting-divider {
  height: 1px;
  background: var(--color-border-muted);
  margin: 0 var(--space-5);
}

.setting-row__info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.setting-row__label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.setting-row__desc {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.setting-select {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-8) var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%236b6966' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-2) center;
  transition: border-color 140ms;
  flex-shrink: 0;
}
.setting-select:focus { border-color: var(--color-accent); }

.theme-toggle {
  display: flex;
  gap: 2px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: 3px;
  flex-shrink: 0;
}

.theme-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-faint);
  transition: background 140ms, color 140ms;
  white-space: nowrap;
}
.theme-btn .ti { font-size: 13px; }
.theme-btn:hover { color: var(--color-text-muted); }
.theme-btn--active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.number-input {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.number-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 140ms, border-color 140ms;
  line-height: 1;
}
.number-btn:hover {
  background: var(--color-accent-faint);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.number-value {
  font-size: var(--text-base);
  font-weight: 500;
  font-family: var(--font-mono);
  color: var(--color-text);
  min-width: 32px;
  text-align: center;
}

.toggle {
  width: 44px;
  height: 24px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-strong);
  cursor: pointer;
  position: relative;
  transition: background 200ms, border-color 200ms;
  flex-shrink: 0;
}

.toggle--on {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
}

.toggle--on .toggle__thumb {
  transform: translateX(20px);
}

.shortcuts-card { padding: var(--space-2) 0; }

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-5);
  transition: background 120ms;
}
.shortcut-row:hover { background: var(--color-surface-2); }

.shortcut-row__label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.danger-text { color: var(--color-danger); }

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 140ms, opacity 140ms;
  flex-shrink: 0;
}

.btn--ghost {
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  border-color: var(--color-border-strong);
}
.btn--ghost:hover { background: var(--color-surface-3); }

.btn--danger {
  background: rgba(192,57,43,0.08);
  color: var(--color-danger);
  border-color: rgba(192,57,43,0.2);
}
.btn--danger:hover { background: rgba(192,57,43,0.15); }

.about-card {
  padding: var(--space-5);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.about-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-style: italic;
  color: var(--color-text);
}

@media (max-width: 768px) {
  .settings-view { padding: var(--space-4); }

  .setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .setting-select,
  .theme-toggle,
  .number-input {
    width: 100%;
    justify-content: flex-start;
  }

  .theme-toggle { justify-content: stretch; }
  .theme-btn    { flex: 1; justify-content: center; }

  .setting-select { width: 100%; }
}
</style>