<template>
  <div class="profile-view">

    <header class="page-header">
      <h1 class="page-title">{{ t.profile_title }}</h1>
      <button
        class="btn btn--ghost"
        @click="authStore.logout().then(() => router.push({ name: 'auth' }))"
      >
        <i class="ti ti-logout" />
        {{t.profile_signout}}
      </button>
    </header>

    <div class="avatar-section">
      <div class="avatar-wrap">
        <img
          v-if="authStore.avatarUrl"
          :src="authStore.avatarUrl"
          :alt="authStore.user?.name"
          class="avatar-img"
        />
        <div v-else class="avatar-placeholder">
          {{ authStore.initials }}
        </div>

        <label class="avatar-upload" for="avatarInput" title="Change photo">
          <i class="ti ti-camera" />
        </label>
        <input
          id="avatarInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style="display:none"
          @change="handleAvatarUpload"
        />
      </div>

      <div class="avatar-info">
        <p class="avatar-name">{{ authStore.user?.name }}</p>
        <p class="avatar-username text-muted">@{{ authStore.user?.username }}</p>
        <button
          v-if="authStore.avatarUrl"
          class="remove-avatar-btn"
          @click="removeAvatar"
        >
          {{t.profile_remove_photo}}
        </button>
      </div>
    </div>

    <section class="profile-section">
      <h2 class="profile-section__title">{{t.profile_personal}}</h2>
      <div class="profile-card">

        <div class="form-group">
          <label class="form-label">{{t.profile_name}}</label>
          <input v-model="form.name" class="form-input" placeholder={{t.profile_name}} />
          <span class="form-error" v-if="errors.name">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">{{t.profile_username}}</label>
          <div class="input-with-prefix">
            <span class="input-prefix">@</span>
            <input
              v-model="form.username"
              class="form-input form-input--prefixed"
              placeholder="t.profile_username"
            />
          </div>
          <span class="form-error" v-if="errors.username">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">{{t.profile_email}}</label>
          <input
            :value="authStore.user?.email"
            class="form-input form-input--disabled"
            disabled
          />
          <span class="form-hint">{{t.profile_email_hint}}</span>
        </div>

        <div class="form-group">
          <label class="form-label">{{t.profile_bio}}</label>
          <textarea
            v-model="form.bio"
            class="form-input form-textarea"
            placeholder='t.profile_bio_placehold'
            maxlength="160"
            rows="3"
          />
          <span class="form-hint">{{ form.bio.length }}/160</span>
        </div>

        <button
          class="btn btn--primary"
          @click="saveProfile"
          :disabled="authStore.loading || !hasChanges"
        >
          <div class="spinner" v-if="authStore.loading" />
          {{t.profile_bio_btn}}
        </button>

      </div>
    </section>

    <section class="profile-section">
      <h2 class="profile-section__title">{{t.profile_section_lang}}</h2>
      <div class="profile-card">
        <div class="form-group">
          <label class="form-label">{{t.profile_section_lang_label}}</label>
          <select v-model="form.targetLanguage" class="form-input form-select">
            <option v-for="l in LANGUAGES" :key="l.code" :value="l.code">
              {{ l.flag }} {{ l.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">{{t.profile_section_lang_native}}</label>
          <select v-model="form.nativeLanguage" class="form-input form-select">
            <option v-for="l in LANGUAGES" :key="l.code" :value="l.code">
              {{ l.flag }} {{ l.name }}
            </option>
          </select>
        </div>
        <button
          class="btn btn--primary"
          @click="saveLanguages"
          :disabled="authStore.loading"
        >
          {{t.profile_section_lang_btn}}
        </button>
      </div>
    </section>

    <section class="profile-section">
      <h2 class="profile-section__title">{{t.profile_section_share}}</h2>
      <div class="profile-card share-card">
        <p class="text-muted" style="font-size: var(--text-sm)">
          {{t.profile_section_share_p}}
        </p>
        <div class="share-actions">
          <button class="btn btn--ghost" @click="copyProfileLink">
            <i class="ti ti-link" />
            {{t.profile_section_share_copy}}
          </button>
          <button class="btn btn--ghost" @click="shareStreak">
            <i class="ti ti-flame" />
            {{t.profile_section_share_streak}}
          </button>
        </div>
        <div class="share-link" v-if="copiedLink">
          <code>{{ copiedLink }}</code>
          <button class="icon-btn" @click="copy(copiedLink)">
            <i class="ti ti-copy" />
          </button>
        </div>
      </div>
    </section>

    <section class="profile-section">
      <RouterLink :to="{ name: 'settings' }" class="settings-link">
        <i class="ti ti-settings" />
        <span>{{t.profile_settings}}</span>
        <i class="ti ti-arrow-right" style="margin-left: auto; color: var(--color-text-faint)" />
      </RouterLink>
    </section>

    <section class="profile-section">
      <h2 class="profile-section__title danger-title">{{t.profile_danger}}</h2>
      <div class="profile-card">
        <div class="danger-row">
          <div>
            <p class="form-label">{{t.profile_delete}}</p>
            <p class="text-faint" style="font-size: var(--text-xs)">
              {{t.profile_delete_warn}}
            </p>
          </div>
          <button class="btn btn--danger" @click="deleteAccount">
            {{t.profile_delete_btn}}
          </button>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter }        from 'vue-router'
import { useAuthStore }     from '@/stores/auth.store'
import { useStreakStore }   from '@/stores/streak.store'
import { useSettingsStore } from '@/stores/settings.store'
import { useToast }         from '@/composables/useToast'
import { createShare }      from '@/services/auth.service'
import { useI18n }          from '@/composables/useI18n'

const router        = useRouter()
const authStore     = useAuthStore()
const streakStore   = useStreakStore()
const settingsStore = useSettingsStore()
const toast         = useToast()
const { t }         = useI18n()

const errors    = ref({})
const copiedLink = ref('')

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

const form = reactive({
  name:           authStore.user?.name           ?? '',
  username:       authStore.user?.username       ?? '',
  bio:            authStore.user?.bio            ?? '',
  targetLanguage: authStore.user?.targetLanguage ?? settingsStore.targetLanguage,
  nativeLanguage: authStore.user?.nativeLanguage ?? settingsStore.nativeLanguage,
})

const hasChanges = computed(() =>
  form.name     !== (authStore.user?.name     ?? '') ||
  form.username !== (authStore.user?.username ?? '') ||
  form.bio      !== (authStore.user?.bio      ?? '')
)

async function handleAvatarUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    toast.error('File too large (max 5MB)')
    return
  }
  try {
    const result = await authStore.uploadAvatar(file)
    if (result.ok) toast.success('Avatar updated')
    else           toast.error(result.message ?? 'Failed to upload avatar')
  } catch (e) {
    console.error('uploadAvatar error:', e)
    toast.error('Failed to upload avatar')
  }
}

async function removeAvatar() {
  const result = await authStore.removeAvatar()
  if (result.ok) toast.success('Avatar removed')
}

async function saveProfile() {
  errors.value = {}
  const result = await authStore.updateProfile({
    name:     form.name,
    username: form.username,
    bio:      form.bio,
  })
  if (result.ok) toast.success('Profile updated')
  else           errors.value = result.errors ?? {}
}

async function saveLanguages() {
  const result = await authStore.updateProfile({
    targetLanguage: form.targetLanguage,
    nativeLanguage: form.nativeLanguage,
  })
  if (result.ok) {
    settingsStore.targetLanguage = form.targetLanguage
    settingsStore.nativeLanguage = form.nativeLanguage
    await settingsStore.save()
    toast.success('Languages updated')
  }
}

function copyProfileLink() {
  const link = `${window.location.origin}/u/${authStore.user?.username}`
  copy(link)
  copiedLink.value = link
  toast.success('Link copied!')
}

async function shareStreak() {
  try {
    const result = await createShare('streak', {
      streakCount: streakStore.currentStreak,
    })
    copy(result.url)
    copiedLink.value = result.url
    toast.success('Share link copied!')
  } catch {
    toast.error('Failed to create share link')
  }
}

function copy(text) {
  navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  })
}

async function deleteAccount() {
  if (!confirm('Delete your account? This cannot be undone.')) return
  toast.error('Account deletion not yet implemented')
}
</script>

<style scoped>
.profile-view {
  padding: var(--space-8);
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-title { font-size: var(--text-2xl); letter-spacing: -0.02em; }

.avatar-section {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.avatar-img,
.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  background: var(--color-accent-faint);
  border: 2px solid var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-accent);
}

.avatar-upload {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 26px;
  height: 26px;
  background: var(--color-accent);
  border: 2px solid var(--color-surface);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 12px;
  transition: background 140ms;
}
.avatar-upload:hover { background: var(--color-accent-hover); }

.avatar-info { display: flex; flex-direction: column; gap: var(--space-1); }
.avatar-name { font-size: var(--text-md); font-weight: 500; }
.avatar-username { font-size: var(--text-sm); }

.remove-avatar-btn {
  font-size: var(--text-xs);
  color: var(--color-danger);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  text-align: left;
  margin-top: var(--space-1);
  transition: opacity 140ms;
}
.remove-avatar-btn:hover { opacity: 0.7; }

.profile-section { display: flex; flex-direction: column; gap: var(--space-3); }

.profile-section__title {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: var(--font-mono);
  color: var(--color-text-faint);
}

.danger-title { color: var(--color-danger); }

.profile-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-group { display: flex; flex-direction: column; gap: var(--space-2); }
.form-label { font-size: var(--text-sm); font-weight: 500; color: var(--color-text-muted); }

.form-input {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
  transition: border-color 140ms, box-shadow 140ms;
  width: 100%;
}
.form-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-faint);
}
.form-input--disabled { opacity: 0.5; cursor: not-allowed; }
.form-input::placeholder { color: var(--color-text-faint); }

.form-textarea { resize: vertical; min-height: 80px; font-family: inherit; }

.form-select {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%236b6966' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-3) center;
  padding-right: var(--space-8);
}

.form-error { font-size: var(--text-xs); color: var(--color-danger); }
.form-hint  { font-size: var(--text-xs); color: var(--color-text-faint); }

.input-with-prefix { position: relative; }
.input-prefix {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  pointer-events: none;
}
.form-input--prefixed { padding-left: calc(var(--space-3) + 14px); }

.share-card { gap: var(--space-3); }

.share-actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.share-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
}

.share-link code {
  flex: 1;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  text-decoration: none;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  transition: border-color 160ms, background 160ms;
}
.settings-link:hover {
  border-color: var(--color-border-strong);
  background: var(--color-surface-2);
  color: var(--color-text);
}
.settings-link .ti-settings { font-size: 18px; color: var(--color-text-faint); }

.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.btn {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm); font-weight: 500;
  border: 1px solid transparent; cursor: pointer;
  transition: background 140ms, transform 80ms, opacity 140ms;
}
.btn:hover:not(:disabled) { transform: translateY(-1px); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.btn--primary { background: var(--color-accent); color: white; border-color: var(--color-accent); }
.btn--primary:hover:not(:disabled) { background: var(--color-accent-hover); }

.btn--ghost {
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  border-color: var(--color-border-strong);
}
.btn--ghost:hover:not(:disabled) { background: var(--color-surface-3); }

.btn--danger {
  background: rgba(192,57,43,0.08);
  color: var(--color-danger);
  border-color: rgba(192,57,43,0.2);
}
.btn--danger:hover { background: rgba(192,57,43,0.15); }

.icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  border-radius: var(--radius-md);
  background: none; border: none; cursor: pointer;
  color: var(--color-text-faint); font-size: 14px;
  transition: color 140ms, background 140ms;
}
.icon-btn:hover { color: var(--color-text); background: var(--color-surface-2); }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 500ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .profile-view { padding: var(--space-4); }
  .avatar-section { flex-direction: column; text-align: center; }
  .avatar-info { align-items: center; }
  .remove-avatar-btn { text-align: center; }
  .danger-row { flex-direction: column; align-items: flex-start; }
  .share-actions { flex-direction: column; }
  .share-actions .btn { width: 100%; justify-content: center; }
}
</style>