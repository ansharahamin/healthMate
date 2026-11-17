import express from 'express'
import { createUser, deleteUser, getUser, listUsers, updateUser } from '../controllers/users.controller.js'
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js'
import { validateObjectId } from '../middlewares/validate-object-id.middleware.js'

const router = express.Router()

router.use(authenticateToken, requireAdmin)
router.get('/', listUsers)
router.post('/', createUser)
router.get('/:id', validateObjectId('id', 'user'), getUser)
router.put('/:id', validateObjectId('id', 'user'), updateUser)
router.delete('/:id', validateObjectId('id', 'user'), deleteUser)

export default router
