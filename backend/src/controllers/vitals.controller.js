import vitalModel from '../models/vital.model.js'
import userModel from '../models/users.models.js'
import { respondWithControllerError } from '../utils/controller-error.js'
import { getUserScopeFilter, resolveCreateUserId } from '../utils/user-scope.js'

const vitalTypes = [
    'blood-pressure',
    'blood-sugar',
    'weight',
    'height',
    'heart-rate',
    'temperature',
    'oxygen-saturation',
    'other',
]
const vitalFields = ['type', 'value', 'systolic', 'diastolic', 'unit', 'recordedAt', 'notes']

function isObjectBody(body) {
    return body !== null && typeof body === 'object' && !Array.isArray(body)
}

function hasOnlyVitalFields(body) {
    return Object.keys(body).every((field) => vitalFields.includes(field))
}

function validateVitalInput(body, { partial = false } = {}) {
    if (!isObjectBody(body) || !hasOnlyVitalFields(body) || (!partial && !vitalTypes.includes(body.type))) {
        return 'Provide valid vital fields.'
    }
    if (body.type !== undefined && !vitalTypes.includes(body.type)) {
        return 'Choose a valid vital type.'
    }

    for (const field of ['value', 'systolic', 'diastolic']) {
        if (body[field] !== undefined && !Number.isFinite(body[field])) {
            return `${field} must be a number.`
        }
    }
    if (body.type === 'blood-pressure' && body.value !== undefined) {
        return 'Blood pressure uses systolic and diastolic values, not a single value.'
    }
    if (body.type !== undefined && body.type !== 'blood-pressure'
        && (body.systolic !== undefined || body.diastolic !== undefined)) {
        return 'Only blood pressure accepts systolic and diastolic values.'
    }
    if (!partial && body.type === 'blood-pressure'
        && (!Number.isFinite(body.systolic) || !Number.isFinite(body.diastolic))) {
        return 'Blood pressure requires numeric systolic and diastolic values.'
    }
    if (!partial && body.type !== 'blood-pressure' && !Number.isFinite(body.value)) {
        return 'Vital value must be a number.'
    }

    if (body.unit !== undefined && typeof body.unit !== 'string') {
        return 'Vital unit must be text.'
    }
    if (body.notes !== undefined && typeof body.notes !== 'string') {
        return 'Vital notes must be text.'
    }
    if (body.recordedAt !== undefined
        && (typeof body.recordedAt !== 'string' || Number.isNaN(Date.parse(body.recordedAt)))) {
        return 'Provide a valid recorded date.'
    }
    if (!partial && body.type !== 'blood-pressure' && (typeof body.unit !== 'string' || !body.unit.trim())) {
        return 'A unit is required for this vital.'
    }
    if (body.type === 'blood-pressure' && body.unit !== undefined && body.unit !== 'mmHg') {
        return 'Blood pressure must use mmHg.'
    }
    return null
}

export async function listVitals(req, res) {
    try {
        const userScope = getUserScopeFilter(req)
        if (!userScope) {
            return res.status(400).json({ message: 'Provide a valid userId filter.' })
        }
        const vitals = await vitalModel.find(userScope).sort({ recordedAt: -1 })
        return res.status(200).json(vitals)
    } catch (error) {
        return respondWithControllerError(res, error, 'Vital list failed', 'Unable to load your vitals.')
    }
}

export async function createVital(req, res) {
    const body = isObjectBody(req.body) ? { ...req.body } : req.body
    const requestedUserId = isObjectBody(body) ? body.userId : undefined
    if (isObjectBody(body)) {
        delete body.userId
    }
    const target = resolveCreateUserId(req, requestedUserId)
    if (target.error) {
        return res.status(req.user.role === 'admin' ? 400 : 403).json({ message: target.error })
    }

    const validationError = validateVitalInput(body)
    if (validationError) {
        return res.status(400).json({ message: validationError })
    }

    try {
        const targetUser = await userModel.findById(target.userId).select('_id')
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found.' })
        }
        const vital = await vitalModel.create({ ...body, userId: targetUser._id })
        return res.status(201).json(vital)
    } catch (error) {
        return respondWithControllerError(res, error, 'Vital creation failed', 'Unable to save this vital.')
    }
}

export async function getVital(req, res) {
    try {
        const userScope = getUserScopeFilter(req)
        if (!userScope) {
            return res.status(400).json({ message: 'Provide a valid userId filter.' })
        }
        const vital = await vitalModel.findOne({ _id: req.params.id, ...userScope })
        if (!vital) {
            return res.status(404).json({ message: 'Vital not found.' })
        }
        return res.status(200).json(vital)
    } catch (error) {
        return respondWithControllerError(res, error, 'Vital fetch failed', 'Unable to load this vital.')
    }
}

export async function updateVital(req, res) {
    const validationError = validateVitalInput(req.body, { partial: true })
    if (validationError || Object.keys(req.body ?? {}).length === 0) {
        return res.status(400).json({ message: validationError ?? 'Provide vital fields to update.' })
    }

    try {
        const userScope = getUserScopeFilter(req)
        if (!userScope) {
            return res.status(400).json({ message: 'Provide a valid userId filter.' })
        }
        const vital = await vitalModel.findOne({ _id: req.params.id, ...userScope })
        if (!vital) {
            return res.status(404).json({ message: 'Vital not found.' })
        }

        const updates = { ...req.body }
        const updatedType = updates.type ?? vital.type
        if (updatedType === 'blood-pressure') {
            const systolic = updates.systolic ?? (vital.type === 'blood-pressure' ? vital.systolic : undefined)
            const diastolic = updates.diastolic ?? (vital.type === 'blood-pressure' ? vital.diastolic : undefined)
            if (updates.value !== undefined || !Number.isFinite(systolic) || !Number.isFinite(diastolic)) {
                return res.status(400).json({ message: 'Blood pressure requires numeric systolic and diastolic values.' })
            }
            if (updates.unit !== undefined && updates.unit !== 'mmHg') {
                return res.status(400).json({ message: 'Blood pressure must use mmHg.' })
            }
        } else {
            if (updates.systolic !== undefined || updates.diastolic !== undefined) {
                return res.status(400).json({ message: 'Only blood pressure accepts systolic and diastolic values.' })
            }
            if (vital.type === 'blood-pressure' && updates.type !== undefined && !Number.isFinite(updates.value)) {
                return res.status(400).json({ message: 'Vital value must be a number.' })
            }
        }
        if (updates.recordedAt !== undefined) {
            updates.recordedAt = new Date(updates.recordedAt)
        }
        if (updates.type === 'blood-pressure') {
            updates.value = undefined
            updates.unit ??= 'mmHg'
        } else if (updates.type !== undefined) {
            updates.systolic = undefined
            updates.diastolic = undefined
        }
        vital.set(updates)
        await vital.save()
        return res.status(200).json(vital)
    } catch (error) {
        return respondWithControllerError(res, error, 'Vital update failed', 'Unable to update this vital.')
    }
}

export async function deleteVital(req, res) {
    try {
        const userScope = getUserScopeFilter(req)
        if (!userScope) {
            return res.status(400).json({ message: 'Provide a valid userId filter.' })
        }
        const vital = await vitalModel.findOneAndDelete({ _id: req.params.id, ...userScope })
        if (!vital) {
            return res.status(404).json({ message: 'Vital not found.' })
        }
        return res.status(200).json({ message: 'Vital deleted.' })
    } catch (error) {
        return respondWithControllerError(res, error, 'Vital deletion failed', 'Unable to delete this vital.')
    }
}

