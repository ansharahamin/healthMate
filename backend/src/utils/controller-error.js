export function respondWithControllerError(res, error, context, message) {
    if (error?.name === 'ValidationError' || error?.name === 'CastError') {
        return res.status(400).json({ message: error.message })
    }

    console.error(`${context}:`, error)
    return res.status(500).json({ message })
}
