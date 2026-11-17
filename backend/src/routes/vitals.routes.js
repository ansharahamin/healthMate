import express from 'express'
import { createVital, deleteVital, getVital, listVitals, updateVital } from '../controllers/vitals.controller.js'
import { authenticateToken } from '../middlewares/auth.middleware.js'
import { validateObjectId } from '../middlewares/validate-object-id.middleware.js'

const router = express.Router()

router.get('/', authenticateToken, listVitals)
router.post('/', authenticateToken, createVital)
router.get('/:id', authenticateToken, validateObjectId('id', 'vital'), getVital)
router.put('/:id', authenticateToken, validateObjectId('id', 'vital'), updateVital)
router.delete('/:id', authenticateToken, validateObjectId('id', 'vital'), deleteVital)

export default router
