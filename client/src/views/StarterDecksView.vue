<template>
  <div class="starter-decks-view">

    <header class="page-header">
      <div>
        <h1 class="page-title">{{ t.starter_decks_title }}</h1>
        <p class="text-muted" style="font-size: var(--text-sm); margin-top: var(--space-1)">
          {{t.starter_decks_title_desc}}
        </p>
      </div>
    </header>

    <div class="lang-filter">
      <button
        v-for="lang in availableLangs"
        :key="lang.code"
        class="lang-pill"
        :class="{ 'lang-pill--active': activeLang === lang.code }"
        @click="activeLang = activeLang === lang.code ? 'all' : lang.code"
      >
        {{ lang.flag }} {{ lang.name }}
      </button>
    </div>

    <div class="starter-grid">
      <div
        v-for="deck in filteredDecks"
        :key="deck.id"
        class="starter-card"
        :class="{ 'starter-card--installed': isInstalled(deck.id) }"
      >
        <div class="starter-card__header">
          <span class="starter-card__icon">{{ deck.icon }}</span>
          <div class="starter-card__tags">
            <span
              v-for="tag in deck.tags"
              :key="tag"
              class="starter-tag"
            >{{ tag }}</span>
          </div>
        </div>

        <h3 class="starter-card__name">{{ deck.name }}</h3>
        <p class="starter-card__desc text-muted">{{ deck.description }}</p>

        <div class="starter-card__meta">
          <span class="starter-meta-item">
            <i class="ti ti-cards" />
            {{ deck.words.length }} {{ t.starter_decks_words }}
          </span>
          <span class="starter-meta-item">
            <i class="ti ti-language" />
            {{ deck.language.toUpperCase() }}
          </span>
        </div>

        <div class="starter-preview">
          <span
            v-for="word in deck.words.slice(0, 4)"
            :key="word.word"
            class="preview-word"
          >{{ word.word }}</span>
          <span class="preview-more" v-if="deck.words.length > 4">
            +{{ deck.words.length - 4 }}
          </span>
        </div>

        <button
          class="starter-card__btn"
          :class="isInstalled(deck.id) ? 'btn--installed' : 'btn--install'"
          @click="!isInstalled(deck.id) && installDeck(deck)"
          :disabled="installing === deck.id"
        >
          <div class="spinner" v-if="installing === deck.id" />
          <i class="ti ti-circle-check" v-else-if="isInstalled(deck.id)" />
          <i class="ti ti-download" v-else />
          {{ isInstalled(deck.id) ? t.starter_decks_added : t.starter_decks_add_btn }}
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDecksStore } from '@/stores/decks.store'
import { useWordsStore }  from '@/stores/words.store'
import { useToast }       from '@/composables/useToast'
import { STARTER_DECKS }  from '@/data/starter-decks'
import { useI18n }        from '@/composables/useI18n'

const router     = useRouter()
const decksStore = useDecksStore()
const wordsStore = useWordsStore()
const toast      = useToast()
const { t }      = useI18n()

const activeLang = ref('all')
const installing = ref(null)
const installedIds = ref(new Set())

const LANG_META = {
  en: { name: 'English',  flag: '🇬🇧' },
  it: { name: 'Italian',  flag: '🇮🇹' },
  es: { name: 'Spanish',  flag: '🇪🇸' },
  fr: { name: 'French',   flag: '🇫🇷' },
  de: { name: 'German',   flag: '🇩🇪' },
}

const availableLangs = computed(() => {
  const langs = [...new Set(STARTER_DECKS.map(d => d.language))]
  return langs.map(code => ({ code, ...LANG_META[code] }))
})

const filteredDecks = computed(() =>
  activeLang.value === 'all'
    ? STARTER_DECKS
    : STARTER_DECKS.filter(d => d.language === activeLang.value)
)

function isInstalled(deckId) {
  return installedIds.value.has(deckId)
}

async function installDeck(starterDeck) {
  installing.value = starterDeck.id

  try {
    const deck = await decksStore.createDeck({
      name:        starterDeck.name,
      language:    starterDeck.language,
      description: starterDeck.description,
      tags:        starterDeck.tags,
    })

    for (const w of starterDeck.words) {
      await wordsStore.addWord({
        ...w,
        deckId:     deck.id,
        language:   starterDeck.language,
        sourceType: 'manual',
      })
    }

    installedIds.value.add(starterDeck.id)
    toast.success(`"${starterDeck.name}" added — ${starterDeck.words.length} words`)
  } catch (e) {
    toast.error('Failed to install deck')
  } finally {
    installing.value = null
  }
}
</script>

<style scoped>
.starter-decks-view {
  padding: var(--space-8);
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.page-title { font-size: var(--text-2xl); letter-spacing: -0.02em; }

.lang-filter {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.lang-pill {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 160ms;
}
.lang-pill:hover { border-color: var(--color-accent); }
.lang-pill--active {
  background: var(--color-accent-faint);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.starter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
}

.starter-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: border-color 160ms, transform 160ms;
}

.starter-card:hover {
  border-color: var(--color-border-strong);
  transform: translateY(-2px);
}

.starter-card--installed {
  border-color: rgba(61,153,112,0.3);
  background: rgba(61,153,112,0.03);
}

.starter-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.starter-card__icon { font-size: 28px; }

.starter-card__tags {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
  justify-content: flex-end;
}

.starter-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
  color: var(--color-text-faint);
  border: 1px solid var(--color-border);
  font-family: var(--font-mono);
}

.starter-card__name {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--color-text);
}

.starter-card__desc {
  font-size: var(--text-xs);
  line-height: var(--leading-snug);
}

.starter-card__meta {
  display: flex;
  gap: var(--space-4);
}

.starter-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--color-text-faint);
}
.starter-meta-item .ti { font-size: 12px; }

.starter-preview {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.preview-word {
  font-size: var(--text-xs);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.preview-more {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  padding: 2px 4px;
}

.starter-card__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 140ms;
  margin-top: var(--space-1);
}

.btn--install {
  background: var(--color-accent);
  color: white;
}
.btn--install:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn--install:disabled { opacity: 0.5; cursor: not-allowed; }

.btn--installed {
  background: rgba(61,153,112,0.1);
  color: var(--color-success);
  border-color: rgba(61,153,112,0.2);
  cursor: default;
}

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 500ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .starter-decks-view { padding: var(--space-4); }
  .starter-grid { grid-template-columns: 1fr; }
}
</style>