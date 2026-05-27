import { Router } from 'express'
import Share from '../models/Share.js'
import { requireAuth } from '../middleware/auth.js'
import { nanoid } from 'nanoid'

const router = Router()

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { type, data } = req.body

    if (!['word', 'streak', 'session'].includes(type)) {
      return res.status(400).json({ error: 'Invalid share type' })
    }

    const share = await Share.create({
      userId: req.user._id,
      type,
      data,
      slug: nanoid(8),
    })

    res.status(201).json({
      slug: share.slug,
      url:  `${process.env.CLIENT_URL}/share/${share.slug}`,
    })
  } catch (err) {
    next(err)
  }
})

router.get('/:slug', async (req, res, next) => {
  try {
    const share = await Share.findOne({ slug: req.params.slug })
      .populate('userId', 'name username avatar')

    if (!share) return res.status(404).json({ error: 'Share not found' })

    res.json({ share })
  } catch (err) {
    next(err)
  }
})

export default router