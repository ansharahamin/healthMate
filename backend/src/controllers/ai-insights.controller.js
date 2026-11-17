import mongoose from 'mongoose'
import aiInsightModel from '../models/ai-insight.model.js'
import fileModel from '../models/files.model.js'
import { generateHealthInsight } from '../../services/gemini.service.js'
import { respondWithControllerError } from '../utils/controller-error.js'
import { getGeminiErrorDetails, getGeminiErrorResponse } from '../utils/gemini-error.js'
import { getUserScopeFilter } from '../utils/user-scope.js'

const insightFields = ['fileId']
const editableInsightFields = [
    'summaryEnglish',
    'summaryRomanUrdu',
    'keyFindings',
    'recommendations',
    'abnormalValues',
    'doctorQuestions',
    'foodSuggestionsToAvoid',
    'foodSuggestionsToPrefer',
    'homeRemedies',
]
const abnormalStatuses = ['high', 'low', 'abnormal']

function isObjectBody(body) {
    return body !== null && typeof body === 'object' && !Array.isArray(body)
}

function hasOnlyFields(body, fields) {
    return Object.keys(body).every((field) => fields.includes(field))
}

function validateInsightContent(body, { partial = false } = {}) {
    if (!isObjectBody(body) || !hasOnlyFields(body, partial ? editableInsightFields : insightFields)) {
        return 'Provide valid AI insight fields.'
    }
    if (!partial && !mongoose.isValidObjectId(body.fileId)) {
        return 'A valid health file id is required.'
    }
    if (partial) {
        for (const field of ['summaryEnglish', 'summaryRomanUrdu']) {
            if (body[field] !== undefined && (typeof body[field] !== 'string' || !body[field].trim())) {
                return 'Summary fields must be non-empty text.'
            }
        }
    }
    for (const field of ['keyFindings', 'recommendations']) {
        if (body[field] !== undefined
            && (!Array.isArray(body[field]) || body[field].some((item) => typeof item !== 'string'))) {
            return `${field} must be an array of text.`
        }
    }
    if (body.abnormalValues !== undefined
        && (!Array.isArray(body.abnormalValues) || body.abnormalValues.some((value) => (
            !isObjectBody(value)
            || typeof value.testName !== 'string'
            || typeof value.result !== 'string'
            || typeof value.referenceRange !== 'string'
            || !abnormalStatuses.includes(value.status)
            || typeof value.explanation !== 'string'
        )))) {
        return 'abnormalValues must contain valid report findings.'
    }
    if (body.doctorQuestions !== undefined
        && (!Array.isArray(body.doctorQuestions)
            || body.doctorQuestions.length < 3
            || body.doctorQuestions.length > 5
            || body.doctorQuestions.some((question) => typeof question !== 'string' || !question.trim()))) {
        return 'Provide between 3 and 5 doctor questions.'
    }
    for (const field of ['foodSuggestionsToAvoid', 'foodSuggestionsToPrefer', 'homeRemedies']) {
        if (body[field] !== undefined
            && (!Array.isArray(body[field]) || body[field].some((item) => typeof item !== 'string'))) {
            return `${field} must be an array of text.`
        }
    }
    return null
}

export async function listInsights(req, res) {
    try {
        const userScope = getUserScopeFilter(req)
        if (!userScope) {
            return res.status(400).json({ message: 'Provide a valid userId filter.' })
        }
        const insights = await aiInsightModel.find(userScope).sort({ createdAt: -1 })
        return res.status(200).json(insights)
    } catch (error) {
        return respondWithControllerError(res, error, 'AI insight list failed', 'Unable to load your AI insights.')
    }
}

export async function createInsight(req, res) {
    const validationError = validateInsightContent(req.body)
    if (validationError) {
        return res.status(400).json({ message: validationError })
    }

    try {
        const userScope = getUserScopeFilter(req)
        if (!userScope) {
            return res.status(400).json({ message: 'Provide a valid userId filter.' })
        }
        const file = await fileModel.findOne({ _id: req.body.fileId, ...userScope })
            .select('+fileUrl +storageFileId +filePath +urlEndpoint +mimeType')
        if (!file) {
            return res.status(404).json({ message: 'Health file not found.' })
        }

        const generatedInsight = await generateHealthInsight(file)
        const insight = await aiInsightModel.create({
            userId: file.userId,
            fileId: file._id,
            ...generatedInsight,
        })
        return res.status(201).json(insight)
    } catch (error) {
        if (error.statusCode === 503) {
            return res.status(503).json({ message: 'Gemini is not configured on the server.' })
        }
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: error.message })
        }
        const details = getGeminiErrorDetails(error)
        console.error('AI insight generation failed:', details)
        const response = getGeminiErrorResponse(details.status)
        return res.status(response.statusCode).json({ message: response.message })
    }
}

export async function getInsight(req, res) {
    try {
        const userScope = getUserScopeFilter(req)
        if (!userScope) {
            return res.status(400).json({ message: 'Provide a valid userId filter.' })
        }
        const insight = await aiInsightModel.findOne({ _id: req.params.id, ...userScope })
        if (!insight) {
            return res.status(404).json({ message: 'AI insight not found.' })
        }
        return res.status(200).json(insight)
    } catch (error) {
        return respondWithControllerError(res, error, 'AI insight fetch failed', 'Unable to load this AI insight.')
    }
}

export async function updateInsight(req, res) {
    const validationError = validateInsightContent(req.body, { partial: true })
    if (validationError || Object.keys(req.body ?? {}).length === 0) {
        return res.status(400).json({ message: validationError ?? 'Provide AI insight fields to update.' })
    }

    try {
        const userScope = getUserScopeFilter(req)
        if (!userScope) {
            return res.status(400).json({ message: 'Provide a valid userId filter.' })
        }
        const insight = await aiInsightModel.findOne({ _id: req.params.id, ...userScope })
        if (!insight) {
            return res.status(404).json({ message: 'AI insight not found.' })
        }
        insight.set(req.body)
        await insight.save()
        return res.status(200).json(insight)
    } catch (error) {
        return respondWithControllerError(res, error, 'AI insight update failed', 'Unable to update this AI insight.')
    }
}

export async function deleteInsight(req, res) {
    try {
        const userScope = getUserScopeFilter(req)
        if (!userScope) {
            return res.status(400).json({ message: 'Provide a valid userId filter.' })
        }
        const insight = await aiInsightModel.findOneAndDelete({ _id: req.params.id, ...userScope })
        if (!insight) {
            return res.status(404).json({ message: 'AI insight not found.' })
        }
        return res.status(200).json({ message: 'AI insight deleted.' })
    } catch (error) {
        return respondWithControllerError(res, error, 'AI insight deletion failed', 'Unable to delete this AI insight.')
    }
}
