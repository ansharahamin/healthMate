import mongoose from 'mongoose'

export function validateObjectId(paramName, resourceName) {
    return (req, res, next) => {
        if (!mongoose.isValidObjectId(req.params[paramName])) {
            return res.status(400).json({ message: `Invalid ${resourceName} id.` })
        }
        return next()
    }
}
