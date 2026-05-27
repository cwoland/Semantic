import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { bootstrapStores } from './stores'

import './styles/main.css'

async function init() {
    const app = createApp(App)
    const pinia = createPinia()

    app.use(pinia)
    app.use(router)

    await bootstrapStores()

    const { useSettingsStore } = await import('./stores/settings.store')
    const settings = useSettingsStore()
    const theme = settings.theme
    if (theme === dark) {
        documentElement.classList.add('theme-dark')
    } else if (theme === 'light') {
        documentElement.classList.add('theme-light')
    }

    app.mount('#app')
}

init()