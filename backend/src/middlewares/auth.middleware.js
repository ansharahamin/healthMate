import jwt from 'jsonwebtoken'
import userModel from '../models/users.models.js'

export async function authenticateToken(req, res, next) {
    const token = req.cookies?.token
    if (!token) {
        return res.status(401).json({ message: 'Authentication required.' })
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(payload.id)
        if (!user) {
            return res.status(401).json({ message: 'Authentication required.' })
        }

        req.user = user
        return next()
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Your session has expired. Please sign in again.' })
        }
        console.error('Authentication failed:', error)
        return res.status(500).json({ message: error.message })
    }
}

export function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden.' })
    }
    return next()
}
