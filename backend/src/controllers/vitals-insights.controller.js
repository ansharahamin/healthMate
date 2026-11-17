import vitalModel from '../models/vital.model.js'
import { generateVitalsInsight as generateGeminiVitalsInsight } from '../../services/gemini.service.js'
import { respondWithControllerError } from '../utils/controller-error.js'
import { getGeminiErrorDetails, getGeminiErrorResponse } from '../utils/gemini-error.js'
import { formatVitalsForInsight } from '../utils/vitals-insight.js'
import { getUserScopeFilter } from '../utils/user-scope.js'

const MAX_ANALYZED_READINGS = 30
const disclaimer = 'This is informational only, not a diagnosis or treatment plan. Do not start, stop, or change medicines based on this summary.'
const urgentCareNote = 'Seek urgent medical care for severe symptoms such as chest pain, severe trouble breathing, fainting, new confusion, or stroke symptoms, regardless of these readings.'

export async function generateVitalsInsight(req, res) {
    const userScope = getUserScopeFilter(req)
    if (!userScope) {
        return res.status(400).json({ message: 'Provide a valid userId filter.' })
    }
    if (req.user.role === 'admin' && !userScope.userId) {
        return res.status(400).json({ message: 'Admins must provide ?userId=<id> to analyze one user at a time.' })
    }

    let vitals
    try {
        vitals = await vitalModel.find(userScope)
            .select('type value systolic diastolic unit recordedAt')
            .sort({ recordedAt: -1 })
            .limit(MAX_ANALYZED_READINGS)
            .lean()
    } catch (error) {
        return respondWithControllerError(res, error, 'Vitals insight data lookup failed', 'Unable to load vitals for analysis.')
    }

    if (vitals.length === 0) {
        return res.status(404).json({ message: 'No vitals are available for analysis.' })
    }

    const readings = formatVitalsForInsight(vitals)
    try {
        const insight = await generateGeminiVitalsInsight(readings)
        return res.status(200).json({
            ...insight,
            readingsAnalyzed: readings.length,
            period: {
                start: readings[0].recordedAt,
                end: readings[readings.length - 1].recordedAt,
            },
            disclaimer,
            urgentCareNote,
        })
    } catch (error) {
        if (error.statusCode === 503) {
            return res.status(503).json({ message: 'Gemini is not configured on the server.' })
        }

        const details = getGeminiErrorDetails(error)
        console.error('Vitals insight generation failed:', details)
        const response = getGeminiErrorResponse(details.status, {
            badRequestMessage: 'Gemini rejected the vitals insight request.',
            fallbackMessage: 'Unable to generate vitals guidance right now.',
        })
        return res.status(response.statusCode).json({ message: response.message })
    }
}
