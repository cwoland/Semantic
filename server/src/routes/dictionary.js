import { Router } from 'express'
import axios from 'axios'

const router = Router()

router.get('/:word', async (req, res, next) => {
    try {
        const { word } = req.params
        const { data } = await axios.get(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
        )

        const entry = data[0]
        const firstMeaning = entry.meanings?.[0]
        const firstDef = firstMeaning?.definitions?.[0]

        res.json({
            word:         entry.word,
            phonetic:     entry.phonetic ?? '',
            audio:        entry.phonetics?.find(p => p.audio)?.audio ?? null,
            partOfSpeech: firstMeaning?.partOfSpeech ?? '',
            definition:   firstDef?.definition ?? '',
            example:      firstDef?.example ?? '',
           synonyms:     firstMeaning?.synonyms?.slice(0, 5) ?? [],
        })
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ error: `Word "${req.params.word}" not found.` })
        }
        next(err)
    }
})

export default router