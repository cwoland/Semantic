<template>
  <div class="auth-view">
    <div class="auth-card">

      <div class="auth-logo">
        <h1 class="auth-logo__title">Semantic</h1>
        <p class="auth-logo__sub">{{t.auth_sub}}</p>
      </div>

      <div class="auth-tabs">
        <button
          class="auth-tab"
          :class="{ 'auth-tab--active': mode === t.auth_tab_login }"
          @click="switchMode('login')"
        >{{t.auth_tab_login}}</button>
        <button
          class="auth-tab"
          :class="{ 'auth-tab--active': mode === t.auth_tab_register }"
          @click="switchMode('register')"
        >{{t.auth_tab_register}}</button>
      </div>

      <form class="auth-form" @submit.prevent="submit" novalidate>

        <Transition name="fade">
          <div v-if="mode === 'register'" class="form-group">
            <label class="form-label">{{t.auth_register_name}}</label>
            <input
              v-model="form.name"
              class="form-input"
              :class="{ 'form-input--error': errors.name }"
              type="text"
              placeholder="t.auth_name_placehold"
              autocomplete="name"
            />
            <span class="form-error" v-if="errors.name">{{ errors.name }}</span>
          </div>
        </Transition>

        <Transition name="fade">
          <div v-if="mode === 'register'" class="form-group">
            <label class="form-label">{{t.auth_register_username}}</label>
            <div class="input-with-prefix">
              <span class="input-prefix">@</span>
              <input
                v-model="form.username"
                class="form-input form-input--prefixed"
                :class="{ 'form-input--error': errors.username }"
                type="text"
                placeholder="t.auth_username_placehold"
                autocomplete="username"
              />
            </div>
            <span class="form-error" v-if="errors.username">{{ errors.username }}</span>
          </div>
        </Transition>

        <div class="form-group">
          <label class="form-label">{{t.auth_register_email}}</label>
          <input
            v-model="form.email"
            class="form-input"
            :class="{ 'form-input--error': errors.email }"
            type="email"
            placeholder="john@example.com"
            autocomplete="email"
          />
          <span class="form-error" v-if="errors.email">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">{{t.auth_register_password}}</label>
          <div class="input-with-suffix">
            <input
              v-model="form.password"
              class="form-input form-input--suffixed"
              :class="{ 'form-input--error': errors.password }"
              :type="showPassword ? 'text' : t.auth_register_password "
              :placeholder="t.auth_register_min_pass"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="input-suffix"
              @click="showPassword = !showPassword"
              aria-label="Toggle password visibility"
            >
              <i :class="['ti', showPassword ? 'ti-eye-off' : 'ti-eye']" />
            </button>
          </div>
          <span class="form-error" v-if="errors.password">{{ errors.password }}</span>
        </div>

        <div class="auth-error" v-if="globalError">
          <i class="ti ti-alert-circle" />
          {{ globalError }}
        </div>

        <button
          type="submit"
          class="btn btn--primary btn--full"
          :disabled="authStore.loading"
        >
          <div class="spinner" v-if="authStore.loading" />
          {{ mode === 'login' ? t.auth_tab_login : t.auth_tab_register }}
        </button>

      </form>
      <div class="password-strength" v-if="mode === 'register' && form.password">
        <div class="strength-bars">
          <div
            v-for="i in 4"
            :key="i"
            class="strength-bar"
            :class="{ 'strength-bar--filled': passwordStrength >= i }"
            :style="{ background: strengthColor }"
          />
        </div>
        <span class="strength-label" :style="{ color: strengthColor }">
          {{ strengthLabel }}
        </span>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useSettingsStore } from '@/stores/settings.store'
import { useI18n } from '@/composables/useI18n'

const router        = useRouter()
const authStore     = useAuthStore()
const settingsStore = useSettingsStore()

const mode         = ref('login')
const showPassword = ref(false)
const globalError  = ref('')
const errors       = ref({})

const { t } = useI18n()

const form = reactive({
  name:     '',
  username: '',
  email:    '',
  password: '',
})

function switchMode(m) {
  mode.value    = m
  errors.value  = {}
  globalError.value = ''
}

const passwordStrength = computed(() => {
  const p = form.password
  let score = 0
  if (p.length >= 8)              score++
  if (/[A-Z]/.test(p))            score++
  if (/[0-9]/.test(p))            score++
  if (/[^A-Za-z0-9]/.test(p))    score++
  return score
})

const strengthLabel = computed(() => {
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return labels[passwordStrength.value] ?? ''
})

const strengthColor = computed(() => {
  const colors = ['', '#C0392B', '#C07A2B', '#3D9970', '#7C4FBE']
  return colors[passwordStrength.value] ?? ''
})

async function submit() {
  errors.value      = {}
  globalError.value = ''

  let result
  if (mode.value === 'login') {
    result = await authStore.login({
      email:    form.email,
      password: form.password,
    })
  } else {
    result = await authStore.register({
      name:     form.name,
      username: form.username,
      email:    form.email,
      password: form.password,
    })
  }

  if (result.ok) {
    if (authStore.user?.targetLanguage) {
      settingsStore.targetLanguage = authStore.user.targetLanguage
      await settingsStore.save()
    }

    const hasLanguage = !!settingsStore.targetLanguage
    router.push({ name: hasLanguage ? 'dashboard' : 'onboarding' })
  } else {
    errors.value      = result.errors ?? {}
    globalError.value = Object.keys(result.errors ?? {}).length
      ? ''
      : result.message
  }
}
</script>

<style scoped>
.auth-view {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: var(--space-6);
}

.auth-card {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  padding: var(--space-8) var(--space-7);
  box-shadow: 0 8px 40px rgba(124, 79, 190, 0.08);
}

.auth-logo { text-align: center; }

.auth-logo__title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-style: italic;
  color: var(--color-text);
  margin-bottom: var(--space-1);
  padding: 5px;
}

.auth-logo__sub {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  padding: 5px;
}

.auth-tabs {
  display: flex;
  gap: 2px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 5px;
}

.auth-tab {
  flex: 1;
  padding: 5px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-faint);
  transition: background 160ms, color 160ms;
}
.auth-tab:hover { color: var(--color-text-muted); }
.auth-tab--active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: 5px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: 5px;
}

.form-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  padding: 5px;
}

.form-input {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
  transition: border-color 160ms, box-shadow 160ms;
  width: 100%;
}
.form-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-faint);
}
.form-input--error {
  border-color: var(--color-danger);
}
.form-input::placeholder { color: var(--color-text-faint); }

.input-with-prefix,
.input-with-suffix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-faint);
  pointer-events: none;
  user-select: none;
}

.form-input--prefixed { padding-left: calc(var(--space-3) + 14px); }

.input-suffix {
  position: absolute;
  right: var(--space-3);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-faint);
  font-size: 16px;
  display: flex;
  padding: 0;
  transition: color 140ms;
}
.input-suffix:hover { color: var(--color-text); }
.form-input--suffixed { padding-right: var(--space-8); }

.form-error {
  font-size: var(--text-xs);
  color: var(--color-danger);
}

.auth-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: rgba(192, 57, 43, 0.08);
  border: 1px solid rgba(192, 57, 43, 0.2);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-danger);
}
.auth-error .ti { font-size: 15px; flex-shrink: 0; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 160ms, opacity 160ms, transform 80ms;
}
.btn:hover:not(:disabled) { transform: translateY(-1px); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn--primary { background: var(--color-accent); color: white; }
.btn--primary:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn--full { width: 100%; }

.password-strength {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: calc(-1 * var(--space-2));
}

.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.strength-bar {
  height: 3px;
  flex: 1;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  transition: background 300ms;
}

.strength-bar--filled {  }

.strength-label {
  font-size: var(--text-xs);
  font-weight: 500;
  min-width: 40px;
  text-align: right;
  transition: color 300ms;
  padding: 5px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 500ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 480px) {
  .auth-card {
    padding: var(--space-6) var(--space-4);
    border-radius: var(--radius-lg);
  }
}
</style>