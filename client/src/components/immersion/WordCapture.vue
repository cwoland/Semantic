<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="word-capture"
        :style="{ top: pos.y + 'px', left: pos.x + 'px' }"
        role="tooltip"
      >
        <div v-if="loading" class="word-capture__loading">
          <div class="spinner" />
          Looking up "{{ word }}"…
        </div>

        <div v-else-if="result" class="word-capture__body">
          <div class="word-capture__top">
            <span class="word-capture__word">{{ result.word }}</span>
            <span class="word-capture__pos text-faint" v-if="result.partOfSpeech">
              {{ result.partOfSpeech }}
            </span>
            <button
              v-if="result.audio"
              class="icon-btn"
              @click="playAudio"
              aria-label="Play pronunciation"
            >
              <i class="ti ti-volume" />
            </button>
          </div>

          <p class="word-capture__translation">{{ result.translation || result.definition }}</p>

          <p class="word-capture__example text-faint" v-if="result.example">
            "{{ result.example }}"
          </p>

          <div class="word-capture__actions">
            <button class="btn-save" @click="$emit('save', result)">
              <i class="ti ti-bookmark" />
              Save
            </button>
            <button class="btn-dismiss" @click="$emit('dismiss')">
              Dismiss
            </button>
          </div>
        </div>

        <div v-else class="word-capture__error text-faint">
          No result for "{{ word }}"
          <button class="btn-dismiss" @click="$emit('dismiss')">✕</button>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  word:    { type: String,  default: '' },
  result:  { type: Object,  default: null },
  loading: { type: Boolean, default: false },
  pos:     { type: Object,  default: () => ({ x: 0, y: 0 }) },
})

defineEmits(['save', 'dismiss'])

function playAudio() {
  if (props.result?.audio) {
    new Audio(props.result.audio).play().catch(() => {})
  }
}
</script>

<style scoped>
.word-capture {
  position: fixed;
  z-index: var(--z-toast);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  width: 280px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
  transform: translateY(-100%) translateY(-var(--space-2));
}

.word-capture__loading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-border-strong);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 500ms linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.word-capture__body { display: flex; flex-direction: column; gap: var(--space-3); }

.word-capture__top {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.word-capture__word {
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  flex: 1;
}

.word-capture__pos {
  font-size: var(--text-xs);
  font-style: italic;
}

.word-capture__translation {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: var(--leading-snug);
}

.word-capture__example {
  font-size: var(--text-xs);
  font-style: italic;
  line-height: var(--leading-snug);
}

.word-capture__actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  cursor: pointer;
  transition: background 140ms;
  flex: 1;
  justify-content: center;
}
.btn-save:hover { background: var(--color-accent-hover); }

.btn-dismiss {
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  cursor: pointer;
  transition: background 140ms;
}
.btn-dismiss:hover { background: var(--color-surface-3); color: var(--color-text); }

.word-capture__error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--text-sm);
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-md);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-faint);
  font-size: 14px;
  transition: color 140ms, background 140ms;
}
.icon-btn:hover { color: var(--color-text); background: var(--color-surface-2); }
</style>