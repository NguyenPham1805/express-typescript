import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'

const verifyUserToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const accessToken = req.headers.authorization?.replace(/^Bearer\s/, '')
  const refreshToken = req.cookies.refreshtoken

  if (!accessToken) {
    res.status(401).json({ message: 'Bạn chưa đăng nhập' })
    return
  }
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
    if (err) {
      if (refreshToken) {
        const decode = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET!
        )

        // @ts-ignore
        if (!decode || !decode.id) {
          res.status(401).json({ message: 'Bạn chưa đăng nhập' })
          return
        }

        const newAccessToken = jwt.sign(
          decode,
          process.env.ACCESS_TOKEN_SECRET!
        )

        const newRefreshToken = jwt.sign(
          decode,
          process.env.REFRESH_TOKEN_SECRET!
        )

        res.setHeader('Authorization', 'Bearer ' + newAccessToken)
        res.cookie('refershtoken', newRefreshToken, {
          httpOnly: true,
          secure: false,
          path: '/',
          sameSite: 'strict'
        })

        // @ts-ignore
        req.user = decode
        next()
        return
      }
      res.status(401).json({ message: 'Bạn chưa đăng nhập' })
      return
    }
    // @ts-ignore
    req.user = user
    next()
    return
  })
}

export default verifyUserToken
