import mssql from 'mssql'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { UserJWT } from '../types'
import { Request } from 'express'

export async function userExistsWithEmail(email: string) {
  const request = new mssql.Request()
  request.input('email', mssql.VarChar, email)
  const res = await request.query(`select * from users where email = @email`)
  return res.recordset.length > 0
}

export function getHashedPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export function getUserIdFromToken(req: Request) {
  const token = req.headers.authorization?.split(' ')[1]
  const { user_id } = jwt.verify(token!, process.env.JWT_SECRET_KEY!) as UserJWT
  return user_id
}
