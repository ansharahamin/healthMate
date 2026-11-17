import express from 'express'
import { generateContent } from '../controllers/test.js'
import {
    createInsight,
    deleteInsight,
    getInsight,
    listInsights,
    updateInsight,
} from '../controllers/ai-insights.controller.js'
import { generateVitalsInsight } from '../controllers/vitals-insights.controller.js'
import { authenticateToken } from '../middlewares/auth.middleware.js'
import { validateObjectId } from '../middlewares/validate-object-id.middleware.js'

const router = express.Router()

router.post('/generate', authenticateToken, generateContent)
router.get('/insights', authenticateToken, listInsights)
router.post('/insights/generate', authenticateToken, createInsight)
router.post('/insights', authenticateToken, createInsight)
router.post('/vitals-insights/generate', authenticateToken, generateVitalsInsight)
router.get('/insights/:id', authenticateToken, validateObjectId('id', 'AI insight'), getInsight)
router.put('/insights/:id', authenticateToken, validateObjectId('id', 'AI insight'), updateInsight)
router.delete('/insights/:id', authenticateToken, validateObjectId('id', 'AI insight'), deleteInsight)

export default router
