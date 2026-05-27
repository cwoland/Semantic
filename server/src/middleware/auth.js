import { verifyAccess } from '../utils/jwt.js'
import User from '../models/User.js'

export async function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization
        if (!header?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' })
        }

        const token = header.split(' ')[1]
        const payload = verifyAccess(token)

        const user = await User.findById(payload.userId)
        if (!user) return res.status(401).json({ error: 'User not found' })
        
        req.user = user
        next()
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' })
            }
            res.status(401).json({ error: 'Invalid token' })
        }
}