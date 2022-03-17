import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import UserModel from '../models/user.model'

class AuthController {
  public static async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(req.body.password, salt)

      const newUser = new UserModel({
        displayName: req.body.displayName,
        username: req.body.username,
        email: req.body.email,
        password: hash
      })

      const user = await newUser.save()
      res.status(200).json(user)
    } catch (err) {
      res.status(500).json(err)
    }
  }

  public static async signInUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserModel.findOne({ username: req.body.username })
      const validPassword = await bcrypt.compare(
        req.body.password,
        user?.password!
      )

      if (!user || !validPassword) {
        res.status(404).json({ message: 'Tên hoặc mật khẩu không đúng!' })
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

      res.status(200).json({
        message: 'Đăng nhập thành công!',
        user,
        tokens,
        cookie: req.cookies
      })
    } catch (err) {
      res.status(500).json(err)
    }
  }

  public static signOutUser(_req: Request, res: Response): void {
    res.clearCookie('refreshtoken')
    res.status(200).json('Đăng xuất thành công!')
  }

  public static async refreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshtoken

    if (!refreshToken) {
      res.status(401).json({ message: 'chưa xác thực' })
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
      expiresIn: '1y'
    })

    return { accessToken, refreshToken }
  }
}

export default AuthController
