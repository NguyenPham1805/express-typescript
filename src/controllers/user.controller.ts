import { Request, Response } from 'express'
import UserModel from '../models/user.model'

class UserController {
  public static async editAvatar(
    _req: Request,
    _res: Response
  ): Promise<void> {}

  public static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id
      const user = await UserModel.findOne(
        { _id: userId },
        'displayName email createdAt updatedAt'
      )
      res
        .status(200)
        .json({ message: `Get user: ${userId} successfully`, user })
    } catch (err) {
      console.log(err)
      res.status(500).json(err)
    }
  }
}

export default UserController
