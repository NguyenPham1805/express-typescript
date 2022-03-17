import { Router } from 'express'
import PostController from '../controllers/post.controller'
import verifyUserToken from '../middleware/verify.middleware'

const router = Router()

router.get('/', verifyUserToken, PostController.getPosts)
router.get('/:id', verifyUserToken, PostController.getPost)
router.get('/user/:id', verifyUserToken, PostController.getPostsUser)
router.post('/create', verifyUserToken, PostController.createPost)
router.post('/update/:id', verifyUserToken, PostController.updatePost)
router.delete('/delete/:id', verifyUserToken, PostController.deletePost)

export default router
