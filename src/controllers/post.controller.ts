import { Request, Response } from 'express'
import { Types } from 'mongoose'
import PostModel from '../models/post.model'

class PostController {
  public static async createPost(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userId = req.user.id
      const data = req.body

      await PostModel.create({ userId, ...data, image: req.file?.filename })
      res.status(200).json({ message: 'create successfully', image: req.file })
    } catch (err) {
      res.status(500).json(err)
    }
  }

  public static async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.id
      const updateData = req.body

      await PostModel.updateOne(
        // @ts-ignore
        { postId, userId: req.user.id },
        { ...updateData, image: req.file?.filename },
        {
          new: true
        }
      )

      res.status(200).json({ message: 'update successfully' })
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

  public static async getPosts(_req: Request, res: Response): Promise<void> {
    try {
      const posts = await PostModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $addFields: {
            displayName: { $arrayElemAt: ['$user.displayName', 0] }
          }
        },
        {
          $project: {
            postId: 1,
            userId: 1,
            title: 1,
            image: 1,
            createdAt: 1,
            updatedAt: 1,
            displayName: 1
          }
        },
        { $sort: { createdAt: -1 } }
      ])
      if (!posts) {
        res.status(404).json({ mesage: 'No post' })
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
      const posts = await PostModel.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $addFields: {
            displayName: { $arrayElemAt: ['$user.displayName', 0] }
          }
        },
        {
          $project: {
            postId: 1,
            userId: 1,
            title: 1,
            image: 1,
            createdAt: 1,
            updatedAt: 1,
            displayName: 1
          }
        },
        { $sort: { createdAt: -1 } }
      ])
      if (!posts) {
        res.status(404).json('No post create!')
        return
      }
      res.status(200).json(posts)
    } catch (err) {
      res.status(500).json(err)
    }
  }

  public static async deletePost(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      await PostModel.deleteOne({ postId: req.params.id, userId: req.user.id })
      res.status(200).json({ message: 'delete successfully' })
    } catch (err) {
      res.status(500).json(err)
    }
  }
}

export default PostController
