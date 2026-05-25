export { useWordsStore }     from './words.store'
export { useDecksStore }     from './decks.store'
export { useStudyStore }     from './study.store'
export { useStreakStore }    from './streak.store'
export { useStatsStore }     from './stats.store'
export { usePhrasesStore }   from './phrases.store'
export { useSettingsStore }  from './settings.store'
export { useImmersionStore } from './immersion.store'
export { useCoursesStore }   from './courses.store'

export async function bootstrapStores() {
  const [
    { useWordsStore },
    { useDecksStore },
    { useStreakStore },
    { useStatsStore },
    { usePhrasesStore },
    { useSettingsStore },
    { useCoursesStore },
  ] = await Promise.all([
    import('./words.store'),
    import('./decks.store'),
    import('./streak.store'),
    import('./stats.store'),
    import('./phrases.store'),
    import('./settings.store'),
    import('./courses.store'),
  ])

  await Promise.all([
    useSettingsStore().loadSettings(),
    useDecksStore().loadDecks(),
    useWordsStore().loadWords(),
    useStreakStore().loadStreak(),
    useStatsStore().loadStats(),
    usePhrasesStore().loadPhrases(),
    useCoursesStore().loadCourses(),
  ])
 }