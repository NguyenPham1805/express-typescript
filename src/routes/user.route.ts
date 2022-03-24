import { Router } from 'express'
import UserController from '../controllers/user.controller'
import verifyUserToken from '../middleware/verify.middleware'

const routes = Router()

routes.get('/:id', verifyUserToken, UserController.getProfile)
routes.post('/:id', verifyUserToken, UserController.editAvatar)

export default routes
