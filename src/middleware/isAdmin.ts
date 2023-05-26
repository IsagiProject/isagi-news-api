import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UserJWT } from '../types'
import { getErrorFormattedResponse } from '../utils/format.js'

export default function isAdmin(req: Request, res: Response, next: () => void) {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    const { admin } = jwt.verify(token!, process.env.JWT_SECRET_KEY!) as UserJWT
    if (admin) {
      next()
      return
    }
  } catch (err) {
    console.log(err)
  }
  res.send(getErrorFormattedResponse(401, 'Unauthorized')).status(401).end()
}
