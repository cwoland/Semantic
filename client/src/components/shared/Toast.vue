<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite" aria-label="Notifications">
      <TransitionGroup name="toast" tag="div" class="toast-stack__inner">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          role="alert"
        >
          <i :class="['ti', iconFor(toast.type)]" aria-hidden="true" />
          <span class="toast__message">{{ toast.message }}</span>
          <button
            class="toast__close"
            @click="remove(toast.id)"
            aria-label="Dismiss notification"
          >
            <i class="ti ti-x" aria-hidden="true" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()

function iconFor(type) {
  const map = {
    success: 'ti-circle-check',
    error:   'ti-circle-x',
    warning: 'ti-alert-triangle',
    info:    'ti-info-circle',
  }
  return map[type] ?? 'ti-info-circle'
}
</script>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: var(--z-toast);
  pointer-events: none;
}

.toast-stack__inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: flex-end;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  min-width: 260px;
  max-width: 380px;
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-text);
  pointer-events: all;
  backdrop-filter: blur(8px);
}

.toast .ti:first-child {
  font-size: 16px;
  flex-shrink: 0;
}

.toast__message {
  flex: 1;
  line-height: var(--leading-snug);
}

.toast--success .ti:first-child { color: var(--color-success); }
.toast--error   .ti:first-child { color: var(--color-danger);  }
.toast--warning .ti:first-child { color: #e67e22; }
.toast--info    .ti:first-child { color: var(--color-text-muted); }

.toast__close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: var(--color-text-faint);
  border-radius: var(--radius-sm);
  transition: color 120ms ease;
  line-height: 1;
  font-size: 14px;
}

.toast__close:hover {
  color: var(--color-text);
}

.toast-enter-active {
  animation: toast-in 240ms cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-leave-active {
  animation: toast-out 180ms ease forwards;
}
.toast-move {
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}
</style>