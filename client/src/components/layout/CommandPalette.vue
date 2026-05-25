<template>
  <Teleport to="body">
    <Transition name="palette">
      <div
        v-if="palette.isOpen.value"
        class="palette-backdrop"
        @click.self="palette.close()"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div class="palette__box">

          <div class="palette__search">
            <i class="ti ti-search" aria-hidden="true" />
            <input
              ref="inputRef"
              v-model="palette.query.value"
              class="palette__input"
              placeholder="Search commands…"
              autocomplete="off"
              spellcheck="false"
              @keydown.arrow-up.prevent="palette.moveUp()"
              @keydown.arrow-down.prevent="palette.moveDown()"
              @keydown.enter.prevent="palette.confirm()"
              @keydown.escape="palette.close()"
              @input="palette.onQueryChange()"
            />
            <kbd class="palette__esc">esc</kbd>
          </div>

          <ul class="palette__list" role="listbox">
            <li
              v-for="(cmd, i) in palette.filtered.value"
              :key="cmd.id"
              class="palette__item"
              :class="{ 'palette__item--active': i === palette.activeIdx.value }"
              role="option"
              :aria-selected="i === palette.activeIdx.value"
              @click="selectCommand(cmd)"
              @mousemove="palette.activeIdx.value = i"
            >
              <i :class="['ti', cmd.icon]" aria-hidden="true" />
              <span class="palette__item-label">{{ cmd.label }}</span>
              <i class="ti ti-arrow-right palette__item-arrow" aria-hidden="true" />
            </li>

            <li v-if="palette.filtered.value.length === 0" class="palette__empty">
              No commands found
            </li>
          </ul>

          <div class="palette__footer">
            <span><kbd>↑↓</kbd> navigate</span>
            <span><kbd>↵</kbd> select</span>
            <span><kbd>esc</kbd> close</span>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useCommandPalette } from '@/composables/useCommandPalette'

const palette  = useCommandPalette()
const inputRef = ref(null)

watch(
  () => palette.isOpen.value,
  async (open) => {
    if (open) {
      await nextTick()
      inputRef.value?.focus()
    }
  }
)

function selectCommand(cmd) {
  cmd.action()
  palette.close()
}
</script>

<style scoped>
.palette-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: var(--z-modal);
  backdrop-filter: blur(2px);
}

.palette__box {
  width: 100%;
  max-width: 520px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.5);
}

.palette__search {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.palette__search .ti-search {
  font-size: 16px;
  color: var(--color-text-faint);
  flex-shrink: 0;
}

.palette__input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: var(--text-base);
  color: var(--color-text);
  caret-color: var(--color-accent);
}

.palette__input::placeholder {
  color: var(--color-text-faint);
}

.palette__esc {
  flex-shrink: 0;
}

.palette__list {
  max-height: 320px;
  overflow-y: auto;
  padding: var(--space-2) var(--space-2);
  list-style: none;
}

.palette__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 100ms ease, color 100ms ease;
}

.palette__item .ti:first-child {
  font-size: 16px;
  flex-shrink: 0;
}

.palette__item--active {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.palette__item--active .palette__item-arrow {
  opacity: 1;
}

.palette__item-label { flex: 1; }

.palette__item-arrow {
  font-size: 13px;
  opacity: 0;
  transition: opacity 100ms ease;
  color: var(--color-accent);
}

.palette__empty {
  padding: var(--space-8) var(--space-4);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-faint);
}

.palette__footer {
  display: flex;
  gap: var(--space-5);
  padding: var(--space-3) var(--space-5);
  border-top: 1px solid var(--color-border);
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.palette__footer kbd {
  margin-right: var(--space-1);
}
</style>