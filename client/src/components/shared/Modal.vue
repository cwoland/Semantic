<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="modal-backdrop"
        @click.self="$emit('update:modelValue', false)"
        role="dialog"
        :aria-label="title"
        aria-modal="true"
      >
        <div class="modal" :style="{ maxWidth: width }">
          <div class="modal__header" v-if="title || $slots.header">
            <slot name="header">
              <h2 class="modal__title">{{ title }}</h2>
            </slot>
            <button
              class="modal__close"
              @click="$emit('update:modelValue', false)"
              aria-label="Close"
            >
              <i class="ti ti-x" />
            </button>
          </div>

          <div class="modal__body">
            <slot />
          </div>

          <div class="modal__footer" v-if="$slots.footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title:      { type: String,  default: '' },
  width:      { type: String,  default: '480px' },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  backdrop-filter: blur(2px);
  padding: var(--space-4);
}

.modal {
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.modal__title {
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
}

.modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-faint);
  transition: color 140ms, background 140ms;
  font-size: 16px;
}
.modal__close:hover { color: var(--color-text); background: var(--color-surface-2); }

.modal__body   { padding: var(--space-6); }

.modal__footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
</style>