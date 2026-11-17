import express from 'express'
import { uploadHealthRecord } from '../controllers/upload.controller.js'
import { deleteFile, getFile, listFiles, updateFile } from '../controllers/files.controller.js'
import { authenticateToken } from '../middlewares/auth.middleware.js'
import { parseHealthRecordUpload } from '../middlewares/upload.middleware.js'
import { validateObjectId } from '../middlewares/validate-object-id.middleware.js'

const router = express.Router()

router.post('/upload', authenticateToken, parseHealthRecordUpload, uploadHealthRecord)
router.get('/', authenticateToken, listFiles)
router.get('/:id', authenticateToken, validateObjectId('id', 'health file'), getFile)
router.put('/:id', authenticateToken, validateObjectId('id', 'health file'), parseHealthRecordUpload, updateFile)
router.delete('/:id', authenticateToken, validateObjectId('id', 'health file'), deleteFile)

export default router
