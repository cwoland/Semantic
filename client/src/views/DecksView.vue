<template>
  <div class="decks-view">

    <header class="page-header">
      <div>
        <h1 class="page-title">Decks</h1>
        <p class="page-sub text-muted">{{ decksStore.decks.length }} deck{{ decksStore.decks.length !== 1 ? 's' : '' }}</p>
      </div>
      <button class="btn btn--primary" @click="showForm = true">
        <i class="ti ti-plus" aria-hidden="true" />
        New deck
      </button>
    </header>

    <div class="deck-grid" v-if="deckProgress.length">
      <DeckCard
        v-for="deck in deckProgress"
        :key="deck.id"
        :deck="deck"
        @study="goStudy"
      />

      <button class="deck-add-card" @click="showForm = true" aria-label="Create new deck">
        <i class="ti ti-plus" aria-hidden="true" />
        <span>New deck</span>
      </button>
    </div>

    <div class="empty-state" v-else>
      <i class="ti ti-stack-2 empty-state__icon" aria-hidden="true" />
      <h2>No decks yet</h2>
      <p class="text-muted">Create a deck to start building your vocabulary.</p>
      <button class="btn btn--primary" @click="showForm = true" style="margin-top: var(--space-4)">
        <i class="ti ti-plus" aria-hidden="true" />
        Create first deck
      </button>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <DeckForm
          v-if="showForm"
          @close="showForm = false"
          @submit="createDeck"
        />
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDecksStore } from '@/stores/decks.store'
import { useToast }      from '@/composables/useToast'
import DeckCard from '@/components/decks/DeckCard.vue'
import DeckForm from '@/components/decks/DeckForm.vue'

const router      = useRouter()
const decksStore  = useDecksStore()
const toast       = useToast()

const showForm    = ref(false)
const deckProgress = computed(() => decksStore.deckProgress)

async function createDeck(data) {
  const deck = await decksStore.createDeck(data)
  showForm.value = false
  toast.success(`"${deck.name}" created`)
  router.push({ name: 'deck-detail', params: { id: deck.id } })
}

function goStudy(deckId) {
  router.push({ name: 'study', params: { deckId } })
}
</script>

<style scoped>
.decks-view {
  padding: var(--space-8);
  max-width: 900px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
}

.page-title {
  font-size: var(--text-2xl);
  letter-spacing: -0.02em;
  margin-bottom: var(--space-1);
}

.page-sub { font-size: var(--text-sm); }

.deck-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-4);
}

.deck-add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-5);
  background: none;
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-xl);
  color: var(--color-text-faint);
  font-size: var(--text-sm);
  cursor: pointer;
  min-height: 180px;
  transition: border-color 160ms, color 160ms, background 160ms;
}
.deck-add-card:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-faint);
}
.deck-add-card .ti { font-size: 24px; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  padding: var(--space-16) var(--space-8);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-xl);
  color: var(--color-text-faint);
}

.empty-state__icon { font-size: 48px; color: var(--color-border-strong); }
.empty-state h2 { font-size: var(--text-lg); color: var(--color-text); }

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  transition: background 140ms, transform 80ms;
}
.btn:hover { transform: translateY(-1px); }

.btn--primary {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border-color: var(--color-accent);
}
.btn--primary:hover { background: var(--color-accent-hover); }
</style>