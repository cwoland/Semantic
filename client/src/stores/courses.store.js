import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/db'
import { COURSE_TEMPLATES } from '@/data/courses'
import { useWordsStore } from './words.store'
import { useDecksStore } from './decks.store'

export const useCoursesStore = defineStore('courses', () => {

  const courses         = ref([])
  const lessonProgress  = ref({})
  const loading         = ref(false)
  const activeCourseId  = ref(null)

  const activeCourse = computed(() =>
    courses.value.find(c => c.id === activeCourseId.value) ?? null
  )

  const coursesByLanguage = computed(() => (lang) =>
    courses.value.filter(c => c.language === lang)
  )

  const lessonStatus = computed(() => (lessonId) => {
    const p = lessonProgress.value[lessonId]
    if (!p) return 'locked'
    if (p.completed) return 'completed'
    if (p.started)   return 'in-progress'
    return 'available'
  })

  const unitProgress = computed(() => (unit) => {
    const lessons = unit.lessons ?? []
    if (!lessons.length) return 0
    const done = lessons.filter(l =>
      lessonProgress.value[l.id]?.completed
    ).length
    return Math.round(done / lessons.length * 100)
  })

  async function loadCourses() {
    loading.value = true
    
    const rawCourses = await db.courses.toArray()

    const enriched = await Promise.all(
      rawCourses.map(async (course) => {
        const units = await db.units
        .where('courseId').equals(unit.id)
        .sortBy('order')

      const unitsWithLessons = await Promise.all(
        units.map(async (unit) => {
          const lessons = await db.lessons
          .where('unitId').equals(unit.id)
          .sortBy('order')
        return { ...unit, lessons }
        })
      )
      return { ...course, units: unitsWithLessons }
      })
    )

    courses.value = enriched

    const progress = await db.lessonProgress.toArray()
    lessonProgress.value = Object.fromEntries(
      progress.map(p => [p.lessonId, p])
    )
    loading.value = false
  }

async function installCourse(language, maxLevel = 'A2') {
  try {
    console.log('installCourse start:', language, maxLevel)
    
    const template = COURSE_TEMPLATES.find(t => t.language === language)
    console.log('template found:', !!template)
    if (!template) return null

    const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const maxIdx = LEVEL_ORDER.indexOf(maxLevel)
    console.log('maxIdx:', maxIdx)

    const unitsToInstall = template.units.filter(u =>
      LEVEL_ORDER.indexOf(u.level) <= maxIdx
    )
    console.log('units to install:', unitsToInstall.length)

    const courseId = await db.courses.add({
      language,
      name:        template.name,
      description: template.description,
      maxLevel,
      installedAt: Date.now(),
    })
    console.log('course created:', courseId)

    for (const ut of unitsToInstall) {
      console.log('creating unit:', ut.title)
      const unitId = await db.units.add({
        courseId,
        title:       ut.title,
        description: ut.description,
        level:       ut.level,
        icon:        ut.icon,
        order:       ut.order,
      })

      for (const lt of ut.lessons) {
        console.log('creating lesson:', lt.title)
        await db.lessons.add({
          unitId,
          courseId,
          title:       lt.title,
          description: lt.description,
          order:       lt.order,
          words:       lt.words,
        })
      }
    }

    await loadCourses()
    return courses.value.find(c => c.id === courseId)
  } catch (e) {
    console.error('installCourse full error:', e)
    throw e
  }
}

  async function startLesson(lesson) {
    const wordsStore = useWordsStore()
    const decksStore = useDecksStore()

    const deck = await decksStore.createDeck({
      name:        lesson.title,
      language:    lesson.language ?? activeCourse.value?.language,
      description: `Course lesson: ${lesson.title}`,
      tags:        ['course'],
    })

    for (const w of lesson.words) {
      await wordsStore.addWord({
        ...w,
        deckId:     deck.id,
        language:   activeCourse.value?.language ?? '',
        sourceType: 'course',
        sourceRef:  { lessonId: lesson.id, lessonTitle: lesson.title },
      })
    }

    await db.lessonProgress.put({
      lessonId:  lesson.id,
      started:   true,
      completed: false,
      deckId:    deck.id,
      startedAt: Date.now(),
    })

    lessonProgress.value[lesson.id] = {
      lessonId: lesson.id,
      started:  true,
      completed: false,
      deckId:   deck.id,
    }

    return deck
  }

  async function completeLesson(lessonId, score) {
    const existing = lessonProgress.value[lessonId] ?? {}
    const updated  = {
      ...existing,
      lessonId,
      completed:   true,
      score,
      completedAt: Date.now(),
    }

    await db.lessonProgress.put(updated)
    lessonProgress.value[lessonId] = updated
  }

  function setActiveCourse(id) {
    activeCourseId.value = id
  }

  return {
    courses, lessonProgress, loading, activeCourseId,
    activeCourse, coursesByLanguage, lessonStatus, unitProgress,
    loadCourses, installCourse, startLesson, completeLesson, setActiveCourse,
  }
})