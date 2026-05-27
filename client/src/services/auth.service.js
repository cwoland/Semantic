import api from './api'

export async function register(data) {
  const { data: res } = await api.post('/api/auth/register', data)
  return res
}

export async function login(data) {
  const { data: res } = await api.post('/api/auth/login', data)
  return res
}

export async function logout(refreshToken) {
  await api.post('/api/auth/logout', { refreshToken })
}

export async function refreshTokens(refreshToken) {
  const { data } = await api.post('/api/auth/refresh', { refreshToken })
  return data
}

export async function getMe() {
  const { data } = await api.get('/api/users/me')
  return data.user
}

export async function updateProfile(data) {
  const { data: res } = await api.patch('/api/users/me', data)
  return res.user
}

export async function uploadAvatar(file) {
  const form = new FormData()
  form.append('avatar', file)
  const { data } = await api.post('/api/users/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.avatar
}

export async function deleteAvatar() {
  await api.delete('/api/users/me/avatar')
}

export async function createShare(type, data) {
  const { data: res } = await api.post('/api/share', { type, data })
  return res
}

export async function getShare(slug) {
  const { data } = await api.get(`/api/share/${slug}`)
  return data.share
}