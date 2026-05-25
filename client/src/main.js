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

    app.mount('#app')
}

init()