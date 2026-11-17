import multer from 'multer'
import path from 'path'
const storage = multer.memoryStorage()

const healthRecordFileTypes = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
}

const healthRecordUpload = multer({
    storage,
    fileFilter(req, file, cb) {
        const extension = path.extname(file.originalname).toLowerCase()
        const isSupportedType = healthRecordFileTypes[file.mimetype]
        const isValidExtension = extension === isSupportedType
            || (file.mimetype === 'image/jpeg' && extension === '.jpeg')
        if (isSupportedType && isValidExtension) {
            return cb(null, true)
        }
        return cb(new Error('Unsupported health document type.'), false)
    },
    limits: { fileSize: 10 * 1024 * 1024 },
})

function parseHealthRecordUpload(req, res, next) {
    healthRecordUpload.single('file')(req, res, (error) => {
        if (!error) return next()
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: 'Health files must be 10 MB or smaller.' })
        }
        if (error.message === 'Unsupported health document type.') {
            return res.status(400).json({ message: 'Upload a PDF, JPEG, PNG, or WebP file.' })
        }
        console.error('Health file request parsing failed:', error)
        return res.status(400).json({ message: 'Unable to read this health file upload.' })
    })
}

export { parseHealthRecordUpload }