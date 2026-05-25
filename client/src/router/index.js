import { createRouter, createWebHistory } from 'vue-router'
import { useDecksStore } from '@/stores'

const DashboardView  = () => import('@/views/DashboardView.vue')
const StudyView      = () => import('@/views/StudyView.vue')
const DecksView      = () => import('@/views/DecksView.vue')
const DeckDetailView = () => import('@/views/DeckDetailView.vue')
const VocabView      = () => import('@/views/VocabView.vue')
const ImmersionView  = () => import('@/views/ImmersionView.vue')
const StatsView      = () => import('@/views/StatsView.vue')
const SettingsView   = () => import('@/views/SettingsView.vue')
const NotFoundView   = () => import('@/views/NotFoundView.vue')

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { title: 'Semantic', transition: 'fade' },
  },
  {
    path: '/study/:deckId',
    name: 'study',
    component: StudyView,
    meta: { title: 'Study — Semantic', transition: 'slide-up', fullscreen: true },
    beforeEnter: async (to) => {
      const decksStore = useDecksStore()
      const deck = decksStore.deckById(Number(to.params.deckId))
      if (!deck) return { name: 'decks' }
    },
  },
  {
    path: '/decks',
    name: 'decks',
    component: DecksView,
    meta: { title: 'Decks — Semantic', transition: 'fade' },
  },
  {
    path: '/decks/:id',
    name: 'deck-detail',
    component: DeckDetailView,
    meta: { title: 'Deck — Semantic', transition: 'slide-right' },
  },
  {
    path: '/vocab',
    name: 'vocab',
    component: VocabView,
    meta: { title: 'Vocabulary — Semantic', transition: 'fade' },
  },
  {
    path: '/immersion',
    name: 'immersion',
    component: ImmersionView,
    meta: { title: 'Immersion — Semantic', transition: 'slide-up', fullscreen: true },
  },
  {
    path: '/stats',
    name: 'stats',
    component: StatsView,
    meta: { title: 'Statistics — Semantic', transition: 'fade' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { title: 'Settings — Semantic', transition: 'slide-right' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: '404 — Semantic' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash)       return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = to.meta.title ?? 'Semantic'
})

export default router