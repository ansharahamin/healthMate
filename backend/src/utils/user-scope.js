import mongoose from 'mongoose'

export function getUserScopeFilter(req) {
    if (req.user.role !== 'admin') {
        return { userId: req.user._id }
    }

    const userId = req.query.userId
    if (userId === undefined || userId === '') {
        return {}
    }
    if (typeof userId !== 'string' || !mongoose.isValidObjectId(userId)) {
        return null
    }

    return { userId }
}

export function resolveCreateUserId(req, requestedUserId) {
    if (req.user.role !== 'admin') {
        if (requestedUserId !== undefined) {
            return { error: 'You cannot create records for another user.' }
        }
        return { userId: req.user._id }
    }

    const userId = requestedUserId ?? req.user._id
    if (requestedUserId !== undefined && typeof requestedUserId !== 'string') {
        return { error: 'Provide a valid userId.' }
    }
    if (!mongoose.isValidObjectId(userId)) {
        return { error: 'Provide a valid userId.' }
    }

    return { userId }
}
