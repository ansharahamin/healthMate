import mongoose from 'mongoose'

const fileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true,
    },
    fileUrl: {
        type: String,
        required: true,
        trim: true,
        select: false,
    },
    storageFileId: {
        type: String,
        required: true,
        select: false,
    },
    filePath: {
        type: String,
        required: true,
        select: false,
    },
    urlEndpoint: {
        type: String,
        required: true,
        select: false,
    },
    mimeType: {
        type: String,
        required: true,
        select: false,
    },
    type: {
        type: String,
        required: true,
        trim: true,
        enum: ['lab-report', 'prescription', 'other'],
    },
    reportDate: {
        type: Date,
        required: true,
    },
    doctorName: {
        type: String,
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
    },
}, { timestamps: true })

fileSchema.index({ userId: 1, reportDate: -1 })

const fileModel = mongoose.model('files', fileSchema, 'files')
export default fileModel
