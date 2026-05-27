export function validateRegister(req, res, next) {
  const { name, username, email, password } = req.body
  const errors = {}

  if (!name || name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters'

  if (!username || !/^[a-z0-9_]{3,30}$/.test(username.toLowerCase()))
    errors.username = 'Username: 3-30 chars, letters, numbers, underscores only'

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Invalid email address'

  if (!password || password.length < 8)
    errors.password = 'Password must be at least 8 characters'

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', errors })
  }
  next()
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body
  const errors = {}

  if (!email) errors.email = 'Email is required'
  if (!password) errors.password = 'Password is required'

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', errors })
  }
  next()
}

export function validateProfileUpdate(req, res, next) {
  const { name, username, bio } = req.body
  const errors = {}

  if (name !== undefined && name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters'

  if (username !== undefined && !/^[a-z0-9_]{3,30}$/.test(username.toLowerCase()))
    errors.username = 'Username: 3-30 chars, letters, numbers, underscores only'

  if (bio !== undefined && bio.length > 160)
    errors.bio = 'Bio max 160 characters'

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Validation failed', errors })
  }
  next()
}