import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { bootstrapStores } from './stores'

import './styles/main.css'
import db from './db/index.js'

async function init() {
  const app   = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  const loadingEl = document.createElement('div')
  loadingEl.id = 'app-loader'
  loadingEl.style.cssText = `
    position:fixed;inset:0;background:var(--color-bg, #FFF8E7);
    display:flex;align-items:center;justify-content:center;z-index:9999;
  `
  loadingEl.innerHTML = `<div style="width:32px;height:32px;border:2px solid #D8C8EE;border-top-color:#7C4FBE;border-radius:50%;animation:spin 600ms linear infinite"></div>
  <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`
  document.body.appendChild(loadingEl)

  try {
    await bootstrapStores()
  } catch (e) {
    console.error('Bootstrap failed:', e)
  }

  const { useSettingsStore } = await import('./stores/settings.store')
  const settings = useSettingsStore()
  if (settings.theme === 'dark') {
    document.documentElement.classList.add('theme-dark')
  } else if (settings.theme === 'light') {
    document.documentElement.classList.add('theme-light')
  }

  app.mount('#app')
  setTimeout(() => loadingEl.remove(), 100)
}

init()