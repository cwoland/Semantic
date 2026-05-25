<template>
  <div class="deck-form-backdrop" @click.self="$emit('close')">
    <div class="deck-form" role="dialog" :aria-label="isEdit ? 'Edit deck' : 'New deck'">

      <div class="deck-form__header">
        <h2>{{ isEdit ? 'Edit deck' : 'New deck' }}</h2>
        <button class="icon-btn" @click="$emit('close')" aria-label="Close">
          <i class="ti ti-x" />
        </button>
      </div>

      <div class="deck-form__body">
        <label class="form-field">
          <span class="form-field__label">Deck name</span>
          <input
            v-model="form.name"
            class="form-input"
            placeholder="e.g. Italian — B2 Vocabulary"
            autofocus
            @keydown.enter="submit"
          />
        </label>

        <label class="form-field">
          <span class="form-field__label">Target language</span>
          <select v-model="form.language" class="form-input form-select">
            <option value="">Select language</option>
            <option v-for="lang in LANGUAGES" :key="lang.code" :value="lang.code">
              {{ lang.flag }} {{ lang.name }}
            </option>
          </select>
        </label>

        <label class="form-field">
          <span class="form-field__label">Description <span class="form-field__opt">(optional)</span></span>
          <input
            v-model="form.description"
            class="form-input"
            placeholder="What is this deck for?"
          />
        </label>

        <div class="form-row">
          <label class="form-field">
            <span class="form-field__label">New cards / day</span>
            <input v-model.number="form.dailyNewLimit" type="number" min="1" max="200" class="form-input" />
          </label>
          <label class="form-field">
            <span class="form-field__label">Reviews / day</span>
            <input v-model.number="form.dailyReviewLimit" type="number" min="1" max="999" class="form-input" />
          </label>
        </div>
      </div>

      <div class="deck-form__footer">
        <button class="btn btn--ghost" @click="$emit('close')">Cancel</button>
        <button class="btn btn--primary" @click="submit" :disabled="!form.name.trim()">
          {{ isEdit ? 'Save changes' : 'Create deck' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const LANGUAGES = [
  { code: 'it', name: 'Italian',    flag: '🇮🇹' },
  { code: 'es', name: 'Spanish',    flag: '🇪🇸' },
  { code: 'fr', name: 'French',     flag: '🇫🇷' },
  { code: 'de', name: 'German',     flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese',   flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese',    flag: '🇨🇳' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian',    flag: '🇷🇺' },
  { code: 'ko', name: 'Korean',     flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic',     flag: '🇸🇦' },
]

const props = defineProps({
  initial: { type: Object, default: null },
})
const emit = defineEmits(['close', 'submit'])

const isEdit = computed(() => !!props.initial)

const form = reactive({
  name:             props.initial?.name             ?? '',
  language:         props.initial?.language         ?? '',
  description:      props.initial?.description      ?? '',
  dailyNewLimit:    props.initial?.settings?.dailyNewLimit    ?? 20,
  dailyReviewLimit: props.initial?.settings?.dailyReviewLimit ?? 100,
})

function submit() {
  if (!form.name.trim()) return
  emit('submit', {
    name:        form.name.trim(),
    language:    form.language,
    description: form.description.trim(),
    settings: {
      dailyNewLimit:    form.dailyNewLimit,
      dailyReviewLimit: form.dailyReviewLimit,
    },
  })
}
</script>

<style scoped>
.deck-form-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  backdrop-filter: blur(2px);
  padding: var(--space-4);
}

.deck-form {
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 460px;
  overflow: hidden;
}

.deck-form__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.deck-form__header h2 {
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
}

.deck-form__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-field__label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.form-field__opt {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}

.form-input {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
  transition: border-color 140ms;
  width: 100%;
}

.form-input:focus {
  border-color: var(--color-accent);
}

.form-input::placeholder { color: var(--color-text-faint); }

.form-select {
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%236b6966' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-3) center;
  padding-right: var(--space-8);
}

.deck-form__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 140ms, opacity 140ms;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.btn--primary {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border-color: var(--color-accent);
}
.btn--primary:hover:not(:disabled) { background: var(--color-accent-hover); }

.btn--ghost {
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  border-color: var(--color-border-strong);
}
.btn--ghost:hover { background: var(--color-surface-3); }

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  color: var(--color-text-faint);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 140ms, background 140ms;
}
.icon-btn:hover { color: var(--color-text); background: var(--color-surface-2); }
</style>