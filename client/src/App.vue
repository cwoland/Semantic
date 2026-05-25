<template>
  <div class="app" :class="{ 'app--fullscreen': isFullscreen }">
    <AppSidebar v-if="!isFullscreen" />

    <main class="app__main">
      <RouterView v-slot="{ Component, route }">
        <Transition :name="route.meta.transition ?? 'fade'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>
    <CommandPalette />
    <ToastStack />

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useKeyboard } from '@/composables/useKeyboard'

import AppSidebar     from '@/components/layout/AppSidebar.vue'
import CommandPalette from '@/components/layout/CommandPalette.vue'
import ToastStack     from '@/components/shared/Toast.vue'

const route = useRoute()

const isFullscreen = computed(() => !!route.meta.fullscreen)

useKeyboard()
</script>

<style scoped>
.app {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
}

.app__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.app--fullscreen .app__main {
  width: 100%;
}
</style>