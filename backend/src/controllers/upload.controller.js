import {
    createHealthRecordDownloadUrl,
    deleteHealthRecordFile,
    uploadHealthRecordFile,
} from '../../services/storage.service.js'
import fileModel from '../models/files.model.js'
import userModel from '../models/users.models.js'
import { hasValidHealthRecordFileSignature } from '../utils/health-record-file.js'
import { resolveCreateUserId } from '../utils/user-scope.js'

const fileTypes = ['lab-report', 'prescription', 'other']

function isValidDate(value) {
    return typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Date.parse(value))
}

async function uploadHealthRecord(req, res) {
    const body = req.body ?? {}
    const { type, reportDate, doctorName = '', notes = '' } = body
    const target = resolveCreateUserId(req, body.userId)
    if (target.error) {
        return res.status(req.user.role === 'admin' ? 400 : 403).json({ message: target.error })
    }
    if (!req.file) {
        return res.status(400).json({ message: 'Choose a health report or prescription to upload.' })
    }
    if (!hasValidHealthRecordFileSignature(req.file.buffer, req.file.mimetype)) {
        return res.status(400).json({ message: 'The uploaded file does not match its file type.' })
    }
    if (!fileTypes.includes(type)) {
        return res.status(400).json({ message: 'Choose a valid health file type.' })
    }
    if (!isValidDate(reportDate)) {
        return res.status(400).json({ message: 'A valid report date is required.' })
    }
    if (typeof doctorName !== 'string' || typeof notes !== 'string') {
        return res.status(400).json({ message: 'Doctor name and notes must be text.' })
    }

    let uploadedFile
    try {
        const targetUser = await userModel.findById(target.userId).select('_id')
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found.' })
        }
        uploadedFile = await uploadHealthRecordFile(req.file.buffer, req.file.originalname, req.file.mimetype)
        const record = new fileModel({
            userId: targetUser._id,
            fileUrl: uploadedFile.fileUrl,
            storageFileId: uploadedFile.fileId,
            filePath: uploadedFile.filePath,
            urlEndpoint: uploadedFile.urlEndpoint,
            mimeType: uploadedFile.mimeType,
            type,
            reportDate: new Date(reportDate),
            doctorName: doctorName.trim(),
            notes: notes.trim(),
        })
        const downloadUrl = createHealthRecordDownloadUrl(record)
        await record.save()

        return res.status(201).json({
            _id: record._id,
            type: record.type,
            reportDate: record.reportDate,
            doctorName: record.doctorName,
            notes: record.notes,
            downloadUrl,
        })
    } catch (error) {
        if (uploadedFile?.fileId) {
            try {
                await deleteHealthRecordFile(uploadedFile.fileId)
            } catch (cleanupError) {
                console.error('Uploaded health file cleanup failed:', cleanupError)
            }
        }
        console.error('Health file upload failed:', error)
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: error.message })
        }
        return res.status(502).json({ message: 'Unable to upload this health file right now.' })
    }
}

export { uploadHealthRecord }
