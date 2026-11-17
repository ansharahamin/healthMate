import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import userModel from '../models/users.models.js'
import fileModel from '../models/files.model.js'
import vitalModel from '../models/vital.model.js'
import aiInsightModel from '../models/ai-insight.model.js'
import { deleteHealthRecordFile } from '../../services/storage.service.js'
import { respondWithControllerError } from '../utils/controller-error.js'

const userFields = ['userName', 'email', 'password', 'role']
const roles = ['user', 'admin']

function isObjectBody(body) {
    return body !== null && typeof body === 'object' && !Array.isArray(body)
}

function hasOnlyUserFields(body) {
    return Object.keys(body).every((field) => userFields.includes(field))
}

function validateUserInput(body, { partial = false } = {}) {
    if (!isObjectBody(body) || !hasOnlyUserFields(body)) {
        return 'Provide valid user fields.'
    }
    if (!partial && (typeof body.userName !== 'string'
        || body.userName.trim().length < 2
        || body.userName.trim().length > 40)) {
        return 'Username must be between 2 and 40 characters.'
    }
    if (body.userName !== undefined && (typeof body.userName !== 'string'
        || body.userName.trim().length < 2
        || body.userName.trim().length > 40)) {
        return 'Username must be between 2 and 40 characters.'
    }
    if (!partial && (typeof body.email !== 'string'
        || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()))) {
        return 'Provide a valid email address.'
    }
    if (body.email !== undefined && (typeof body.email !== 'string'
        || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()))) {
        return 'Provide a valid email address.'
    }
    if (!partial && (typeof body.password !== 'string'
        || body.password.length < 8
        || body.password.length > 128)) {
        return 'Password must be between 8 and 128 characters.'
    }
    if (body.password !== undefined && (typeof body.password !== 'string'
        || body.password.length < 8
        || body.password.length > 128)) {
        return 'Password must be between 8 and 128 characters.'
    }
    if (body.role !== undefined && !roles.includes(body.role)) {
        return 'Choose a valid user role.'
    }
    return null
}

function serializeUser(user) {
    return {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }
}

async function ensureAdminRemains(user, nextRole) {
    if (user.role === 'admin' && nextRole !== 'admin') {
        return (await userModel.countDocuments({ role: 'admin' })) > 1
    }
    return true
}

export async function listUsers(req, res) {
    try {
        const users = await userModel.find()
            .select('userName email role createdAt updatedAt')
            .sort({ createdAt: -1 })
        return res.status(200).json(users.map(serializeUser))
    } catch (error) {
        return respondWithControllerError(res, error, 'User list failed', 'Unable to load users.')
    }
}

export async function createUser(req, res) {
    const validationError = validateUserInput(req.body)
    if (validationError) {
        return res.status(400).json({ message: validationError })
    }

    try {
        const user = await userModel.create({
            userName: req.body.userName.trim(),
            email: req.body.email.trim().toLowerCase(),
            password: await bcrypt.hash(req.body.password, 10),
            role: req.body.role ?? 'user',
        })
        return res.status(201).json(serializeUser(user))
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'That username or email is already in use.' })
        }
        return respondWithControllerError(res, error, 'User creation failed', 'Unable to create this user.')
    }
}

export async function getUser(req, res) {
    try {
        const user = await userModel.findById(req.params.id)
            .select('userName email role createdAt updatedAt')
        if (!user) {
            return res.status(404).json({ message: 'User not found.' })
        }
        return res.status(200).json(serializeUser(user))
    } catch (error) {
        return respondWithControllerError(res, error, 'User fetch failed', 'Unable to load this user.')
    }
}

export async function updateUser(req, res) {
    const validationError = validateUserInput(req.body, { partial: true })
    if (validationError || Object.keys(req.body ?? {}).length === 0) {
        return res.status(400).json({ message: validationError ?? 'Provide user fields to update.' })
    }

    try {
        const user = await userModel.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: 'User not found.' })
        }
        if (!await ensureAdminRemains(user, req.body.role ?? user.role)) {
            return res.status(409).json({ message: 'The last admin account cannot be demoted.' })
        }

        const updates = { ...req.body }
        if (updates.userName !== undefined) {
            updates.userName = updates.userName.trim()
        }
        if (updates.email !== undefined) {
            updates.email = updates.email.trim().toLowerCase()
        }
        if (updates.password !== undefined) {
            updates.password = await bcrypt.hash(updates.password, 10)
        }
        user.set(updates)
        await user.save()
        return res.status(200).json(serializeUser(user))
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'That username or email is already in use.' })
        }
        return respondWithControllerError(res, error, 'User update failed', 'Unable to update this user.')
    }
}

export async function deleteUser(req, res) {
    try {
        const user = await userModel.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: 'User not found.' })
        }
        if (!await ensureAdminRemains(user, 'user')) {
            return res.status(409).json({ message: 'The last admin account cannot be deleted.' })
        }

        const files = await fileModel.find({ userId: user._id }).select('+storageFileId')
        const fileDeletionFailures = []
        for (const file of files) {
            try {
                await deleteHealthRecordFile(file.storageFileId)
            } catch (error) {
                fileDeletionFailures.push(error)
                console.error('User health file deletion failed:', error)
            }
        }
        if (fileDeletionFailures.length > 0) {
            return res.status(502).json({
                message: 'Unable to delete all stored health files; the user account was not deleted. Retry the request.',
            })
        }

        await aiInsightModel.deleteMany({ userId: user._id })
        await vitalModel.deleteMany({ userId: user._id })
        await fileModel.deleteMany({ userId: user._id })
        await user.deleteOne()
        return res.status(200).json({ message: 'User and associated health data deleted.' })
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ message: 'Provide a valid user id.' })
        }
        return respondWithControllerError(res, error, 'User deletion failed', 'Unable to delete this user.')
    }
}
