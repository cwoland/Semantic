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
    courses.value = await db.courses.toArray()

    const progress = await db.lessonProgress.toArray()
    lessonProgress.value = Object.fromEntries(
      progress.map(p => [p.lessonId, p])
    )
    loading.value = false
  }

  async function installCourse(language, maxLevel = 'A2') {
    const template = COURSE_TEMPLATES.find(t => t.language === language)
    if (!template) return null

    const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const maxIdx = LEVELS.indexOf(maxLevel)

    const unitsToInstall = template.units.filter(u =>
      LEVELS.indexOf(u.level) <= maxIdx
    )

    const courseId = await db.courses.add({
      language,
      name:        template.name,
      description: template.description,
      maxLevel,
      installedAt: Date.now(),
    })

    for (const unitTemplate of unitsToInstall) {
      const unitId = await db.units.add({
        courseId,
        title:       unitTemplate.title,
        description: unitTemplate.description,
        level:       unitTemplate.level,
        icon:        unitTemplate.icon,
        order:       unitTemplate.order,
      })

      for (const lessonTemplate of unitTemplate.lessons) {
        await db.lessons.add({
          unitId,
          courseId,
          title:       lessonTemplate.title,
          description: lessonTemplate.description,
          order:       lessonTemplate.order,
          words:       lessonTemplate.words,
        })
      }
    }

    await loadCourses()

    const course = courses.value.find(c => c.id === courseId)
    return course
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