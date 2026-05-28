<template>
  <div class="course-view">

    <div v-if="coursesStore.loading" class="course-loading">
      <div class="spinner" />
    </div>
    <div v-else-if="!hasCourse" class="course-setup">
      <h1 class="page-title">{{ t.course_title}}</h1>
      <p class="text-muted">{{ t.course_setup_sub }} {{ langName }}</p>

      <div class="level-picker">
        <h2 class="level-picker__title">{{ t.course_pick_level }}</h2>
        <div class="level-grid">
          <button
            v-for="level in LEVELS"
            :key="level"
            class="level-btn"
            :class="{ 'level-btn--active': selectedLevel === level }"
            @click="selectedLevel = level"
          >
            <span class="level-btn__code">{{ level }}</span>
            <span class="level-btn__desc">{{ LEVEL_DESCRIPTIONS[level] }}</span>
          </button>
        </div>
      </div>

      <button
        class="btn btn--primary btn--lg"
        :disabled="!selectedLevel || installing"
        @click="installCourse"
      >
        <div class="spinner" v-if="installing" />
        <i class="ti ti-download" v-else />
        {{ installing ? t.course_setting_up : `${t.course_start} ${langName}` }}
      </button>
    </div>
    <div v-else>
      <header class="page-header">
        <div>
          <p class="text-muted" style="font-size: var(--text-sm)">
            {{ currentCourse.name }}
          </p>
          <h1 class="page-title">{{t.course_title}}</h1>
        </div>
        <div class="course-meta">
          <span class="level-badge">Up to {{ currentCourse.maxLevel }}</span>
          <span class="text-faint" style="font-size: var(--text-xs)">
            {{ completedLessons }} / {{ totalLessons }} {{t.course_lessons}}
          </span>
        </div>
      </header>
      <div class="course-progress">
        <div class="course-progress__bar">
          <div
            class="course-progress__fill"
            :style="{ width: overallProgress + '%' }"
          />
        </div>
        <span class="text-faint" style="font-size: var(--text-xs)">
          {{ overallProgress }}% {{t.course_complete}}
        </span>
      </div>
      <div class="units-list">
        <div
          v-for="unit in units"
          :key="unit.id"
          class="unit-card"
          :class="`unit-card--${unit.level.toLowerCase()}`"
        >
          <div class="unit-card__header" @click="toggleUnit(unit.id)">
            <div class="unit-card__left">
              <span class="unit-card__icon">{{ unit.icon }}</span>
              <div>
                <div class="unit-card__level-badge">{{ unit.level }}</div>
                <h3 class="unit-card__title">{{ unit.title }}</h3>
                <p class="unit-card__desc text-muted">{{ unit.description }}</p>
              </div>
            </div>
            <div class="unit-card__right">
              <div class="unit-progress-ring">
                <svg viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" class="ring-bg" />
                  <circle
                    cx="18" cy="18" r="15.9"
                    class="ring-fill"
                    :stroke-dasharray="`${coursesStore.unitProgress(unit)} 100`"
                  />
                </svg>
                <span class="ring-label">{{ coursesStore.unitProgress(unit) }}%</span>
              </div>
              <i
                :class="['ti', openUnits.has(unit.id) ? 'ti-chevron-up' : 'ti-chevron-down']"
                style="color: var(--color-text-faint)"
              />
            </div>
          </div>

          <Transition name="slide-up">
            <div v-if="openUnits.has(unit.id)" class="unit-card__lessons">
              <div
                v-for="lesson in unit.lessons"
                :key="lesson.id"
                class="lesson-row"
                :class="`lesson-row--${coursesStore.lessonStatus(lesson.id)}`"
              >
                <div class="lesson-row__icon">
                  <i v-if="coursesStore.lessonStatus(lesson.id) === 'completed'"
                     class="ti ti-circle-check" />
                  <i v-else-if="coursesStore.lessonStatus(lesson.id) === 'in-progress'"
                     class="ti ti-player-play" />
                  <i v-else class="ti ti-lock" />
                </div>

                <div class="lesson-row__content">
                  <span class="lesson-row__title">{{ lesson.title }}</span>
                  <span class="lesson-row__desc text-faint">
                    {{ lesson.description }} · {{ lesson.words.length }} {{t.vocab_words}}
                  </span>
                </div>

                <button
                  class="lesson-row__btn"
                  @click="startLesson(lesson, unit)"
                  :disabled="coursesStore.lessonStatus(lesson.id) === 'completed'"
                >
                  {{
                    coursesStore.lessonStatus(lesson.id) === 'completed' ? t.course_done :
                    coursesStore.lessonStatus(lesson.id) === 'in-progress' ? t.course_continue :
                    t.course_start_lesson
                  }}
                </button>
              </div>
            </div>
          </Transition>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCoursesStore } from '@/stores/courses.store'
import { useSettingsStore } from '@/stores/settings.store'
import { useToast }         from '@/composables/useToast'
import { LEVELS, LEVEL_DESCRIPTIONS, COURSE_TEMPLATES } from '@/data/courses'
import { useI18n } from '@/composables/useI18n'

const router        = useRouter()
const coursesStore  = useCoursesStore()
const settingsStore = useSettingsStore()
const toast         = useToast()

const selectedLevel = ref('A1')
const installing    = ref(false)
const openUnits     = ref(new Set())

const { t } = useI18n()

const lang    = computed(() => settingsStore.targetLanguage)
const langName = computed(() => {
  const names = { it: 'Italian', es: 'Spanish', fr: 'French',
                  de: 'German', ja: 'Japanese', en: 'English',
                  zh: 'Chinese', pt: 'Portuguese', ru: 'Russian' }
  return names[lang.value] ?? lang.value.toUpperCase()
})

const hasCourse = computed(() =>
  coursesStore.courses.some(c => c.language === lang.value)
)

const currentCourse = computed(() =>
  courses.value.find(c => c.language === lang.value)
)

const units = computed(() => currentCourse.value?.units ?? [])

const totalLessons = computed(() =>
  units.value.reduce((s, u) => s + (u.lessons?.length ?? 0), 0)
)

const completedLessons = computed(() =>
  units.value.reduce((s, u) =>
    s + (u.lessons ?? []).filter(l =>
      coursesStore.lessonProgress[l.id]?.completed
    ).length, 0)
)

const overallProgress = computed(() =>
  totalLessons.value
    ? Math.round(completedLessons.value / totalLessons.value * 100)
    : 0
)

onMounted(async () => {
  await coursesStore.loadCourses()
  if (units.value.length) {
    openUnits.value = new Set([units.value[0].id])
  }
})

function toggleUnit(id) {
  openUnits.value.has(id)
    ? openUnits.value.delete(id)
    : openUnits.value.add(id)
}

async function installCourse() {
  installing.value = true
  try {
    const course = await coursesStore.installCourse(lang.value, selectedLevel.value)
    if (course) {
      toast.success(`${langName.value} course ready!`)
      await coursesStore.loadCourses()
      if (units.value.length) {
        openUnits.value = new Set([units.value[0].id])
      }
    } else {
      toast.error(t.value.course_no_course)
    }
  } catch (e) {
    console.error('installCourse error:', e)
    toast.error('Failed to install course')
  } finally {
    installing.value = false
  }
}

async function startLesson(lesson, unit) {
  const deck = await coursesStore.startLesson({
    ...lesson,
    language: lang.value,
  })
  toast.success(`"${lesson.title}" deck created`)
  router.push({ name: 'study', params: { deckId: deck.id } })
}
</script>

<style scoped>
.course-view {
  padding: var(--space-8);
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.page-title { font-size: var(--text-2xl); letter-spacing: -0.02em; }

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.course-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
}

.level-badge {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  background: var(--color-accent-faint);
  color: var(--color-accent);
  border: 1px solid rgba(124,79,190,0.2);
}

.course-setup {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.level-picker { display: flex; flex-direction: column; gap: var(--space-4); }
.level-picker__title { font-size: var(--text-lg); }

.level-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.level-btn {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  text-align: left;
  transition: border-color 160ms, background 160ms, transform 120ms;
}
.level-btn:hover {
  border-color: var(--color-accent);
  transform: translateY(-1px);
}
.level-btn--active {
  border-color: var(--color-accent);
  background: var(--color-accent-faint);
  box-shadow: 0 0 0 2px rgba(124,79,190,0.15);
}

.level-btn__code {
  font-size: var(--text-lg);
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--color-accent);
}

.level-btn__desc {
  font-size: var(--text-xs);
  color: var(--color-text-faint);
  line-height: var(--leading-snug);
}

.course-progress {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.course-progress__bar {
  flex: 1;
  height: 6px;
  background: var(--color-surface-3);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.course-progress__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--lilac-300));
  border-radius: var(--radius-full);
  transition: width 600ms cubic-bezier(0.22, 1, 0.36, 1);
}

.units-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.unit-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  overflow: hidden;
  transition: border-color 200ms;
}
.unit-card:hover { border-color: var(--color-border-strong); }

.unit-card--a1 { border-left: 3px solid #3D9970; }
.unit-card--a2 { border-left: 3px solid #27AE60; }
.unit-card--b1 { border-left: 3px solid #C07A2B; }
.unit-card--b2 { border-left: 3px solid #C0392B; }
.unit-card--c1 { border-left: 3px solid var(--color-accent); }
.unit-card--c2 { border-left: 3px solid var(--ink-900); }

.unit-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5);
  cursor: pointer;
  gap: var(--space-4);
}

.unit-card__left {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  min-width: 0;
}

.unit-card__icon { font-size: 28px; flex-shrink: 0; line-height: 1; }

.unit-card__level-badge {
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--color-accent);
  letter-spacing: 0.08em;
  margin-bottom: 2px;
}

.unit-card__title {
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.unit-card__desc { font-size: var(--text-xs); }

.unit-card__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.unit-progress-ring {
  position: relative;
  width: 36px;
  height: 36px;
}

.unit-progress-ring svg {
  width: 36px;
  height: 36px;
  transform: rotate(-90deg);
}

.ring-bg   { fill: none; stroke: var(--color-surface-3); stroke-width: 3; }
.ring-fill {
  fill: none;
  stroke: var(--color-accent);
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 600ms cubic-bezier(0.22, 1, 0.36, 1);
}

.ring-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-family: var(--font-mono);
  color: var(--color-text-faint);
}

.unit-card__lessons {
  border-top: 1px solid var(--color-border-muted);
  padding: var(--space-2) 0;
}

.lesson-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-5);
  transition: background 120ms;
}
.lesson-row:hover { background: var(--color-surface-2); }

.lesson-row__icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
  background: var(--color-surface-2);
  color: var(--color-text-faint);
}

.lesson-row--completed .lesson-row__icon {
  background: rgba(61,153,112,0.12);
  color: var(--color-success);
}

.lesson-row--in-progress .lesson-row__icon {
  background: var(--color-accent-faint);
  color: var(--color-accent);
}

.lesson-row__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.lesson-row__title {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.lesson-row__desc { font-size: var(--text-xs); }

.lesson-row__btn {
  font-size: var(--text-xs);
  font-weight: 500;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface-2);
  color: var(--color-text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: background 140ms, border-color 140ms, color 140ms;
  flex-shrink: 0;
}
.lesson-row__btn:hover:not(:disabled) {
  background: var(--color-accent-faint);
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.lesson-row__btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg); border: none; cursor: pointer;
  font-size: var(--text-sm); font-weight: 500;
  transition: background 140ms, transform 80ms, opacity 140ms;
}
.btn:hover:not(:disabled) { transform: translateY(-1px); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn--primary { background: var(--color-accent); color: var(--color-text-inverse); }
.btn--primary:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn--lg { padding: var(--space-4) var(--space-8); font-size: var(--text-base); }
.btn--lg .spinner { width: 16px; height: 16px; }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 500ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>