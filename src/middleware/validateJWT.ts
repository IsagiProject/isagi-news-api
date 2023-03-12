import jwt from 'jsonwebtoken'
import { Request, Response } from 'express'
import { getErrorFormattedResponse } from '../utils/format.js'

export default function validateJWT(
  req: Request,
  res: Response,
  next: () => void
) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res
      .send(getErrorFormattedResponse(401, 'Token not provided'))
      .status(401)
      .end()
    return
  }
  const token = authHeader.split(' ')[1]
  try {
    jwt.verify(token, process.env.JWT_SECRET_KEY!)
  } catch (err) {
    res
      .send(getErrorFormattedResponse(401, 'Not valid token'))
      .status(401)
      .end()
    return
  }
  next()
}
