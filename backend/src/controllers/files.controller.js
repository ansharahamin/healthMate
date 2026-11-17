import aiInsightModel from '../models/ai-insight.model.js'
import fileModel from '../models/files.model.js'
import {
    createHealthRecordDownloadUrl,
    deleteHealthRecordFile,
    uploadHealthRecordFile,
} from '../../services/storage.service.js'
import { respondWithControllerError } from '../utils/controller-error.js'
import { hasValidHealthRecordFileSignature } from '../utils/health-record-file.js'
import { getUserScopeFilter } from '../utils/user-scope.js'

const fileTypes = ['lab-report', 'prescription', 'other']
const fileFields = ['type', 'reportDate', 'doctorName', 'notes']

function isObjectBody(body) {
    return body !== null && typeof body === 'object' && !Array.isArray(body)
}

function hasOnlyFileFields(body) {
    return Object.keys(body).every((field) => fileFields.includes(field))
}

function serializeFile(file, downloadUrl = createHealthRecordDownloadUrl(file)) {
    return {
        _id: file._id,
        userId: file.userId,
        type: file.type,
        reportDate: file.reportDate,
        doctorName: file.doctorName,
        notes: file.notes,
        mimeType: file.mimeType,
        downloadUrl,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
    }
}

const privateFileFields = '+fileUrl +storageFileId +filePath +urlEndpoint +mimeType'

export async function listFiles(req, res) {
    try {
        const userScope = getUserScopeFilter(req)
        if (!userScope) {
            return res.status(400).json({ message: 'Provide a valid userId filter.' })
        }
        const files = await fileModel.find(userScope)
            .select(privateFileFields)
            .sort({ reportDate: -1, createdAt: -1 })
        return res.status(200).json(files.map(serializeFile))
    } catch (error) {
        return respondWithControllerError(res, error, 'Health file list failed', 'Unable to load your health files.')
    }
}

export async function getFile(req, res) {
    try {
        const userScope = getUserScopeFilter(req)
        if (!userScope) {
            return res.status(400).json({ message: 'Provide a valid userId filter.' })
        }
        const file = await fileModel.findOne({ _id: req.params.id, ...userScope })
            .select(privateFileFields)
        if (!file) {
            return res.status(404).json({ message: 'Health file not found.' })
        }
        return res.status(200).json(serializeFile(file))
    } catch (error) {
        return respondWithControllerError(res, error, 'Health file fetch failed', 'Unable to load this health file.')
    }
}

export async function updateFile(req, res) {
    const body = req.body ?? {}
    if (!isObjectBody(body)
        || (Object.keys(body).length === 0 && !req.file)
        || !hasOnlyFileFields(body)) {
        return res.status(400).json({ message: 'Provide valid health file fields to update.' })
    }
    if (body.type !== undefined && !fileTypes.includes(body.type)) {
        return res.status(400).json({ message: 'Choose a valid health file type.' })
    }
    if (body.reportDate !== undefined
        && (typeof body.reportDate !== 'string' || Number.isNaN(Date.parse(body.reportDate)))) {
        return res.status(400).json({ message: 'Provide a valid report date.' })
    }
    for (const field of ['doctorName', 'notes']) {
        if (body[field] !== undefined && typeof body[field] !== 'string') {
            return res.status(400).json({ message: `${field} must be text.` })
        }
    }
    if (req.file && !hasValidHealthRecordFileSignature(req.file.buffer, req.file.mimetype)) {
        return res.status(400).json({ message: 'The uploaded file does not match its file type.' })
    }

    let uploadedFile
    let recordUpdated = false
    try {
        const userScope = getUserScopeFilter(req)
        if (!userScope) {
            return res.status(400).json({ message: 'Provide a valid userId filter.' })
        }
        const file = await fileModel.findOne({ _id: req.params.id, ...userScope })
            .select(privateFileFields)
        if (!file) {
            return res.status(404).json({ message: 'Health file not found.' })
        }

        const oldStorageFileId = file.storageFileId
        const updates = { ...body }
        if (updates.reportDate !== undefined) {
            updates.reportDate = new Date(updates.reportDate)
        }
        if (req.file) {
            uploadedFile = await uploadHealthRecordFile(req.file.buffer, req.file.originalname, req.file.mimetype)
            Object.assign(updates, {
                fileUrl: uploadedFile.fileUrl,
                storageFileId: uploadedFile.fileId,
                filePath: uploadedFile.filePath,
                urlEndpoint: uploadedFile.urlEndpoint,
                mimeType: uploadedFile.mimeType,
            })
        }
        file.set(updates)
        const downloadUrl = createHealthRecordDownloadUrl(file)
        await file.save()
        recordUpdated = true

        const warnings = []
        if (uploadedFile) {
            try {
                await aiInsightModel.deleteMany({ fileId: file._id, userId: file.userId })
            } catch (error) {
                console.error('Outdated health file insight cleanup failed:', error)
                warnings.push('The file was replaced, but previous AI insights could not be removed.')
            }
            try {
                await deleteHealthRecordFile(oldStorageFileId)
            } catch (error) {
                console.error('Replaced health file cleanup failed:', error)
                warnings.push('The file was replaced, but the previous stored file could not be removed.')
            }
        }

        const response = serializeFile(file, downloadUrl)
        if (warnings.length > 0) {
            response.warning = warnings.join(' ')
        }
        return res.status(200).json(response)
    } catch (error) {
        if (uploadedFile?.fileId && !recordUpdated) {
            try {
                await deleteHealthRecordFile(uploadedFile.fileId)
            } catch (cleanupError) {
                console.error('New health file cleanup failed:', cleanupError)
            }
        }
        return respondWithControllerError(res, error, 'Health file update failed', 'Unable to update this health file.')
    }
}

export async function deleteFile(req, res) {
    try {
        const userScope = getUserScopeFilter(req)
        if (!userScope) {
            return res.status(400).json({ message: 'Provide a valid userId filter.' })
        }
        const file = await fileModel.findOne({ _id: req.params.id, ...userScope })
            .select(privateFileFields)
        if (!file) {
            return res.status(404).json({ message: 'Health file not found.' })
        }

        await deleteHealthRecordFile(file.storageFileId)
        await aiInsightModel.deleteMany({ fileId: file._id, userId: file.userId })
        await file.deleteOne()
        return res.status(200).json({ message: 'Health file deleted.' })
    } catch (error) {
        return respondWithControllerError(res, error, 'Health file deletion failed', 'Unable to delete this health file.')
    }
}

