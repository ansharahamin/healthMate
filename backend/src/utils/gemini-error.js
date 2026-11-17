function getGeminiErrorDetails(error) {
    const status = Number.isInteger(error?.status) ? error.status : error?.statusCode
    let message = typeof error?.message === 'string' ? error.message : 'Unknown Gemini error.'
    const causeCode = error?.cause?.code ?? error?.cause?.cause?.code

    try {
        const parsed = JSON.parse(message)
        message = parsed.error?.message ?? message
    } catch {
        // Keep the original message when the SDK error is not JSON.
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
        message = message.replaceAll(apiKey, '[redacted]')
    }

    return {
        status,
        stage: error?.healthMateStage ?? 'unknown',
        sourceStatus: error?.healthMateSourceStatus,
        causeCode,
        message: message.slice(0, 1000),
    }
}

function getGeminiErrorResponse(status, {
    badRequestMessage = 'Gemini rejected the report or generation request.',
    fallbackMessage = 'Unable to generate an insight for this health file.',
} = {}) {
    if (status === 401 || status === 403) {
        return {
            statusCode: 502,
            message: 'Gemini rejected the server credentials. Check GEMINI_API_KEY and its API access.',
        }
    }
    if (status === 404) {
        return { statusCode: 502, message: 'The configured Gemini model is unavailable.' }
    }
    if (status === 429) {
        return { statusCode: 503, message: 'Gemini quota or rate limit reached. Try again later.' }
    }
    if (status === 503) {
        return { statusCode: 503, message: 'Gemini is temporarily unavailable. Please try again shortly.' }
    }
    if (status === 400) {
        return { statusCode: 502, message: badRequestMessage }
    }
    return { statusCode: 502, message: fallbackMessage }
}

export { getGeminiErrorDetails, getGeminiErrorResponse }
