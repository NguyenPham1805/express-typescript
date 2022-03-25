import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import UserModel from '../models/user.model'

class AuthController {
  public static async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const errors: string[] = []

      if (req.body.username.length > 5) {
        const user = await UserModel.findOne(
          { username: req.body.username },
          'username'
        )
        if (user) {
          errors.push(
            'This username was registered before, try again with another username'
          )
        }
      } else {
        errors.push('Username is too short')
      }

      if (req.body.email.length > 0) {
        const user = await UserModel.findOne({ email: req.body.email }, 'email')
        if (user) {
          errors.push(
            'This email was registered before, try again with another username'
          )
        }
      }

      if (req.body.password.length < 8) {
        errors.push('Password must be more than 8 characters ')
      }

      if (req.body.displayName.length < 6) {
        errors.push('Diaplay name is too short')
      }

      if (!errors.length) {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(req.body.password, salt)

        const newUser = new UserModel({
          displayName: req.body.displayName,
          username: req.body.username,
          email: req.body.email,
          photoUrl: req.body.photoUrl,
          password: hash
        })

        await newUser.save()
        const currentUser = await UserModel.findOne({
          username: req.body.username
        }).select([
          'username',
          'displayName',
          'email',
          'createdAt',
          'updatedAt'
        ])

        const tokens = AuthController.generateTokens({
          id: currentUser?._id,
          username: currentUser?.username
        })

        res.cookie('refreshtoken', tokens.refreshToken, {
          httpOnly: true,
          secure: false,
          path: '/',
          sameSite: 'strict'
        })

        res.status(200).json({
          message: 'Register successfully',
          // @ts-ignore
          currentUser: { ...currentUser?._doc, accessToken: tokens.accessToken }
        })
      } else {
        res.status(422).json({ message: 'Register fail', errors })
      }
    } catch (err) {
      res.status(500).json(err)
    }
  }

  public static async signInUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserModel.findOne({
        $or: [
          { username: req.body.emailOrUsername },
          { email: req.body.emailOrUsername }
        ]
      })

      if (!user) {
        res.status(404).json({
          message: 'Sign in failed!',
          errors: ['Username or password invalid!']
        })
        return
      }

      const validPassword = await bcrypt.compare(
        req.body.password,
        user?.password!
      )
      if (!validPassword) {
        res.status(404).json({
          message: 'Sign in failed',
          errors: ['Username or password invalid!']
        })
        return
      }

      const tokens = AuthController.generateTokens({
        id: user._id,
        username: user.username
      })

      res.cookie('refreshtoken', tokens.refreshToken, {
        httpOnly: true,
        secure: false,
        path: '/',
        sameSite: 'strict'
      })

      //@ts-ignore
      const { _id, displayName, username, email, createdAt, updatedAt } = user

      res.status(200).json({
        message: 'Sign in successfully!',
        currentUser: {
          _id,
          displayName,
          username,
          email,
          createdAt,
          updatedAt,
          accessToken: tokens.accessToken
        }
      })
    } catch (err) {
      res.status(500).json(err)
    }
  }

  public static signOutUser(_req: Request, res: Response): void {
    try {
      res.clearCookie('refreshtoken')
      res.status(200).json({ message: 'Sign out successfully!' })
    } catch (err) {
      res.status(500).json({ message: 'Some think when wrong!' })
    }
  }

  public static async refreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshtoken

    if (!refreshToken) {
      res.status(401).json({ message: 'Unauthorize' })
      return
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
      (err: any, user: any) => {
        if (err) console.log(err)

        const tokens = AuthController.generateTokens({
          id: user._id,
          username: user.username
        })

        res.cookie('refreshtoken', tokens.refreshToken, {
          httpOnly: true,
          secure: false,
          path: '/',
          sameSite: 'strict'
        })

        res.status(200).json(tokens)
      }
    )
  }

  private static generateTokens(payload: any) {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: '2h'
    })
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: '30d'
    })

    return { accessToken, refreshToken }
  }
}

export default AuthController
