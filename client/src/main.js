import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { bootstrapStores } from './stores'

import './styles/main.css'
import db from './db/index.js'

async function init() {
    const app = createApp(App)
    const pinia = createPinia()

    app.use(pinia)
    app.use(router)

    try {
    await bootstrapStores()
    } catch (e) {
        console.error('Bootstrap failed:', e)
        try {
            await db.delete()
            await db.open()
        } catch {}
    }

    const { useSettingsStore } = await import('./stores/settings.store')
    const settings = useSettingsStore()
    if (settings.theme === 'dark') {
        document.documentElement.classList.add('theme-dark')
    } else if (settings.theme === 'light') {
        document.documentElement.classList.add('theme-light')
    }

    app.mount('#app')
}

init()