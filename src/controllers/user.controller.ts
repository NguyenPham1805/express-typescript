import { Request, Response } from 'express'
import UserModel from '../models/user.model'

class UserController {
  public static async createUser(req: Request, res: Response): Promise<void> {
    // try {
    //   const user = await UserModel
    // }
  }
}

export default UserController
