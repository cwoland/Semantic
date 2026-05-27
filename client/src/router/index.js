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
const OnboardingView = () => import('@/views/OnboardingView.vue')
const CourseView     = () => import('@/views/CourseView.vue')
const AuthView       = () => import('@/views/AuthView.vue')
const ProfileView    = () => import('@/views/ProfileView.vue')
const ShareView      = () => import('@/views/ShareView.vue')

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
    meta: { title: 'Deck — Semantic', transition: 'slide-right', fullscreen: true },
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
    meta: { title: 'Immersion — Semantic', transition: 'slide-up' },
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
  {
    path: '/welcome',
    name: 'onboarding',
    component: OnboardingView,
    meta: { title: 'Welcome — Semantic', transition: 'fade', fullscreen: true },
  },
  {
    path: '/course',
    name: 'course',
    component: CourseView,
    meta: { title: 'Course — Semantic', transition: 'fade' },
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: { title: 'Sign in - Semantic', fullscreen: true, public: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { title: 'Profile - Semantic', transition: 'slide-right' },
  },
  {
    path: '/share/:slug',
    name: 'share',
    component: ShareView,
    meta: { title: 'Semantic', fullscreen: true, public: true },
  },
  {
    path: '/u/:username',
    name: 'public-profile',
    component: ShareView,
    meta: { title:'Profile - Semantic', fullscreen: true, public: true },
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

router.beforeEach(async (to) => {
  const { useSettingsStore } = await import('@/stores/settings.store')
  const { useAuthStore }     = await import('@/stores/auth.store')

  const settings  = useSettingsStore()
  const authStore = useAuthStore()

  if (!settings._loaded) await settings.loadSettings()

  const isPublic     = !!to.meta.public
  const isAuth       = to.name === 'auth'
  const isOnboarding = to.name === 'onboarding'
  const isShare      = to.name === 'share' || to.name === 'public-profile'

  if (isPublic || isShare) return

  if (!authStore.isLoggedIn && !authStore.initializing) {
    if (!isAuth) return { name: 'auth' }
  }

  if (authStore.isLoggedIn && isAuth) {
    return settings.targetLanguage
      ? { name: 'dashboard' }
      : { name: 'onboarding' }
  }

  if (!settings.targetLanguage && !isOnboarding) {
    return { name: 'onboarding' }
  }
})

export default router