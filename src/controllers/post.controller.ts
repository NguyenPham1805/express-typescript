import { Request, Response } from 'express'
import PostModel from '../models/post.model'

class PostController {
  public static async createPost(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userId = req.user.id
      const data = req.body

      const post = await PostModel.create({ userId, ...data })
      res.send({ post })
    } catch (err) {
      res.status(500).json(err)
    }
  }

  public static async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.id
      const updateData = req.body

      const updatePost = await PostModel.updateOne({ postId }, updateData, {
        new: true
      })

      res.send(updatePost)
    } catch (err) {
      res.status(500).json(err)
    }
  }

  public static async getPost(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.id
      const post = await PostModel.findOne({ _id: postId })
      res.status(200).json(post)
    } catch (err) {
      res.status(500).json(err)
    }
  }

  public static async getPosts(req: Request, res: Response): Promise<void> {
    try {
      const posts = await PostModel.find()
      if (!posts) {
        res.status(404).json({ mesage: 'Không có bài viết nào' })
        return
      }
      res.status(200).json(posts)
    } catch (err) {
      res.status(500).json(err)
    }
  }

  public static async getPostsUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id
      const posts = await PostModel.find({ userId })
      if (!posts) {
        res.status(404).json('Chưa có bài viết nào!')
        return
      }
      res.status(200).json(posts)
    } catch (err) {
      res.status(500).json(err)
    }
  }

  public static async deletePost(req: Request, res: Response): Promise<void> {
    try {
      await PostModel.deleteOne({ postId: req.params.id })
      res.status(200).json({ message: 'Xóa thành công' })
    } catch (err) {
      res.status(500).json(err)
    }
  }
}

export default PostController
