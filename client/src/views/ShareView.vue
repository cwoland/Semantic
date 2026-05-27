<template>
  <div class="share-view">
    <div class="share-card" v-if="share">

      <div class="share-user">
        <img
          v-if="share.userId?.avatar?.url"
          :src="share.userId.avatar.url"
          class="share-avatar"
          :alt="share.userId.name"
        />
        <div v-else class="share-avatar-placeholder">
          {{ share.userId?.name?.[0] ?? '?' }}
        </div>
        <div>
          <p class="share-user__name">{{ share.userId?.name }}</p>
          <p class="share-user__handle text-muted">@{{ share.userId?.username }}</p>
        </div>
      </div>

      <div v-if="share.type === 'word'" class="share-content share-content--word">
        <p class="share-word">{{ share.data.word }}</p>
        <p class="share-translation text-muted">{{ share.data.translation }}</p>
        <p class="share-example" v-if="share.data.example">
          "{{ share.data.example }}"
        </p>
        <span class="share-lang">{{ share.data.language?.toUpperCase() }}</span>
      </div>

      <div v-else-if="share.type === 'streak'" class="share-content share-content--streak">
        <i class="ti ti-flame share-flame flame-pulse" />
        <p class="share-streak-count">{{ share.data.streakCount }}</p>
        <p class="share-streak-label text-muted">day streak on Semantic</p>
      </div>

      <div v-else-if="share.type === 'session'" class="share-content share-content--session">
        <p class="share-session-score">{{ share.data.correct }}/{{ share.data.total }}</p>
        <p class="text-muted">cards correct in "{{ share.data.deckName }}"</p>
      </div>

      <RouterLink :to="{ name: 'auth' }" class="share-cta">
        Start learning on Semantic →
      </RouterLink>

    </div>

    <div v-else-if="loading" class="share-loading">
      <div class="spinner" />
    </div>

    <div v-else class="share-notfound">
      <p class="text-muted">This share link has expired or doesn't exist.</p>
      <RouterLink :to="{ name: 'dashboard' }" class="btn btn--ghost">
        Go to dashboard
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getShare } from '@/services/auth.service'

const route   = useRoute()
const share   = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    share.value = await getShare(route.params.slug)
  } catch {
    share.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.share-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: var(--space-6);
}

.share-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  text-align: center;
  box-shadow: 0 8px 40px rgba(124, 79, 190, 0.08);
}

.share-user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.share-avatar,
.share-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.share-avatar-placeholder {
  background: var(--color-accent-faint);
  border: 1px solid var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--color-accent);
}

.share-user__name   { font-size: var(--text-sm); font-weight: 500; }
.share-user__handle { font-size: var(--text-xs); }

.share-content { width: 100%; }

.share-word {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--text-2xl);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.share-translation { font-size: var(--text-md); margin-bottom: var(--space-3); }
.share-example { font-size: var(--text-sm); font-style: italic; color: var(--color-text-faint); }
.share-lang {
  display: inline-block;
  margin-top: var(--space-3);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.share-flame {
  font-size: 48px;
  color: var(--color-accent);
  display: block;
  margin-bottom: var(--space-2);
}

.share-streak-count {
  font-size: 64px;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--color-text);
  line-height: 1;
  margin-bottom: var(--space-2);
}

.share-session-score {
  font-size: var(--text-2xl);
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--color-text);
}

.share-cta {
  font-size: var(--text-sm);
  color: var(--color-accent);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 140ms;
}
.share-cta:hover { opacity: 0.7; }

.share-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.share-notfound {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.spinner {
  width: 28px; height: 28px;
  border: 2px solid var(--color-border-strong);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 500ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.btn {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg); font-size: var(--text-sm);
  font-weight: 500; border: 1px solid transparent;
  cursor: pointer; text-decoration: none;
}
.btn--ghost {
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  border-color: var(--color-border-strong);
}
</style>