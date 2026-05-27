import { Router } from 'express'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { validateProfileUpdate } from '../middleware/validate.js'
import { uploadAvatar, cloudinary } from '../config/cloudinary.js'

const router = Router()

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toPublicJSON() })
})

router.patch('/me', requireAuth, validateProfileUpdate, async (req, res, next) => {
  try {
    const { name, username, bio, targetLanguage, nativeLanguage } = req.body
    const user = req.user

    if (username && username.toLowerCase() !== user.username) {
      const existing = await User.findOne({ username: username.toLowerCase() })
      if (existing) {
        return res.status(409).json({
          error: 'Validation failed',
          errors: { username: 'Username already taken' },
        })
      }
    }

    if (name            !== undefined) user.name           = name.trim()
    if (username        !== undefined) user.username       = username.toLowerCase()
    if (bio             !== undefined) user.bio            = bio
    if (targetLanguage  !== undefined) user.targetLanguage = targetLanguage
    if (nativeLanguage  !== undefined) user.nativeLanguage = nativeLanguage

    user.updatedAt = Date.now()
    await user.save()

    res.json({ user: user.toPublicJSON() })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/me/avatar',
  requireAuth,
  uploadAvatar.single('avatar'),
  async (req, res, next) => {
    try {
      const user = req.user
      if (user.avatar?.publicId) {
        await cloudinary.uploader.destroy(user.avatar.publicId)
      }

      user.avatar = {
        url:      req.file.path,
        publicId: req.file.filename,
      }
      user.updatedAt = Date.now()
      await user.save()

      res.json({ avatar: user.avatar })
    } catch (err) {
      next(err)
    }
  }
)

router.delete('/me/avatar', requireAuth, async (req, res, next) => {
  try {
    const user = req.user
    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId)
    }
    user.avatar = { url: null, publicId: null }
    user.updatedAt = Date.now()
    await user.save()
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.get('/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json({
      user: {
        name:           user.name,
        username:       user.username,
        avatar:         user.avatar,
        bio:            user.bio,
        targetLanguage: user.targetLanguage,
        createdAt:      user.createdAt,
      },
    })
  } catch (err) {
    next(err)
  }
})

export default router