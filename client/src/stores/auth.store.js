import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  register as apiRegister,
  login as apiLogin,
  logout as apiLogout,
  getMe,
  updateProfile as apiUpdateProfile,
  uploadAvatar as apiUploadAvatar,
  deleteAvatar as apiDeleteAvatar,
} from '@/services/auth.service'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {

  const user         = ref(null)
  const loading      = ref(false)
  const initializing = ref(true)

  const isLoggedIn   = computed(() => !!user.value)
  const accessToken  = computed(() => localStorage.getItem('accessToken'))
  const avatarUrl    = computed(() =>
    user.value?.avatar?.url ?? null
  )
  const initials = computed(() => {
    if (!user.value?.name) return '?'
    return user.value.name
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  })

async function init() {
  initializing.value = true
  
  const storedAccess  = localStorage.getItem('accessToken')
  const storedRefresh = localStorage.getItem('refreshToken')

  if (!storedAccess && !storedRefresh) {
    initializing.value = false
    return
  }
  try {
    user.value = await getMe()
  } catch {
    if (storedRefresh) {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || ''}/api/auth/refresh`,
          { refreshToken: storedRefresh }
        )
        localStorage.setItem('accessToken',  data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        user.value = await getMe()
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        user.value = null
      }
    } else {
      localStorage.removeItem('accessToken')
      user.value = null
    }
  } finally {
    initializing.value = false
  }
}

  async function register(data) {
    loading.value = true
    try {
      const res = await apiRegister(data)
      localStorage.setItem('accessToken',  res.accessToken)
      localStorage.setItem('refreshToken', res.refreshToken)
      user.value = res.user
      return { ok: true }
    } catch (err) {
      return {
        ok:     false,
        errors: err.response?.data?.errors ?? {},
        message: err.response?.data?.error ?? 'Registration failed',
      }
    } finally {
      loading.value = false
    }
  }

  async function login(data) {
    loading.value = true
    try {
      const res = await apiLogin(data)
      localStorage.setItem('accessToken',  res.accessToken)
      localStorage.setItem('refreshToken', res.refreshToken)
      user.value = res.user
      return { ok: true }
    } catch (err) {
      return {
        ok:     false,
        errors: err.response?.data?.errors ?? {},
        message: err.response?.data?.error ?? 'Login failed',
      }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      await apiLogout(refreshToken)
    } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    user.value = null
  }

  async function updateProfile(data) {
    loading.value = true
    try {
      user.value = await apiUpdateProfile(data)
      return { ok: true }
    } catch (err) {
      return {
        ok:     false,
        errors: err.response?.data?.errors ?? {},
      }
    } finally {
      loading.value = false
    }
  }

  async function uploadAvatar(file) {
    loading.value = true
    try {
      const avatar = await apiUploadAvatar(file)
      user.value = { ...user.value, avatar }
      return { ok: true }
    } catch (err) {
      return { ok: false, message: 'Failed to upload avatar' }
    } finally {
      loading.value = false
    }
  }

  async function removeAvatar() {
    loading.value = true
    try {
      await apiDeleteAvatar()
      user.value = { ...user.value, avatar: { url: null, publicId: null } }
      return { ok: true }
    } catch {
      return { ok: false }
    } finally {
      loading.value = false
    }
  }

  return {
    user, loading, initializing,
    isLoggedIn, accessToken, avatarUrl, initials,
    init, register, login, logout,
    updateProfile, uploadAvatar, removeAvatar,
  }
})