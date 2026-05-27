import { Router } from 'express'
import User from '../models/User.js'
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt.js'
import { validateRegister, validateLogin } from '../middleware/validate.js'

const router = Router()

router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body

    const existing = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    })

    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'email' : 'username'
      return res.status(409).json({
        error: 'Validation failed',
        errors: { [field]: `This ${field} is already taken` },
      })
    }

    const user = await User.create({ name, username, email, password })

    const accessToken  = signAccess({ userId: user._id })
    const refreshToken = signRefresh({ userId: user._id })

    user.refreshToken = refreshToken
    await user.save()

    res.status(201).json({
      user:         user.toPublicJSON(),
      accessToken,
      refreshToken,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({
        error: 'Validation failed',
        errors: { email: 'No account found with this email' },
      })
    }

    const valid = await user.comparePassword(password)
    if (!valid) {
      return res.status(401).json({
        error: 'Validation failed',
        errors: { password: 'Incorrect password' },
      })
    }

    const accessToken  = signAccess({ userId: user._id })
    const refreshToken = signRefresh({ userId: user._id })

    user.refreshToken = refreshToken
    await user.save()

    res.json({
      user:         user.toPublicJSON(),
      accessToken,
      refreshToken,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' })
    }

    const payload = verifyRefresh(refreshToken)
    const user    = await User.findById(payload.userId).select('+refreshToken')

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    const newAccess  = signAccess({ userId: user._id })
    const newRefresh = signRefresh({ userId: user._id })

    user.refreshToken = newRefresh
    await user.save()

    res.json({ accessToken: newAccess, refreshToken: newRefresh })
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' })
  }
})

router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (refreshToken) {
      const payload = verifyRefresh(refreshToken)
      await User.findByIdAndUpdate(payload.userId, { refreshToken: null })
    }
  } catch {}
  res.json({ ok: true })
})

export default router