import { Router } from 'express'
import AuthController from '../controllers/auth.controller'

const router = Router()

router.post('/register', AuthController.registerUser)
router.post('/sign-in', AuthController.signInUser)
router.post('/sign-out', AuthController.signOutUser)
router.post('/refresh-token', AuthController.refreshToken)

export default router
