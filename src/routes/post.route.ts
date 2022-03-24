import { Router } from 'express'
import multer from 'multer'
import { nanoid } from 'nanoid'

import PostController from '../controllers/post.controller'
import verifyUserToken from '../middleware/verify.middleware'

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, './dist/public/post-images')
  },
  filename: (_req, file, cb) => {
    cb(null, 'eye-' + nanoid(10) + file.originalname)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/gif'
    ) {
      cb(null, true)
    } else cb(null, false)
  }
})
const router = Router()

router.get('/', verifyUserToken, PostController.getPosts)
router.get('/:id', verifyUserToken, PostController.getPost)
router.get('/user/:id', verifyUserToken, PostController.getPostsUser)
router.post(
  '/create',
  verifyUserToken,
  upload.single('postImage'),
  PostController.createPost
)
router.post(
  '/update/:id',
  verifyUserToken,
  upload.single('postImage'),
  PostController.updatePost
)
router.delete('/delete/:id', verifyUserToken, PostController.deletePost)

export default router
