import express from 'express'
import jwt from 'jsonwebtoken'
import mssql from 'mssql'
import crypto from 'crypto'
import { sendRecoverMail } from '../utils/mailing.js'
import { getErrorFormattedResponse } from '../utils/format.js'
import { UserJWT } from '../types/index.js'

const router = express.Router()

router.use((req, res, next) => {
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
})

router.post('/recover', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  const { user_id, email } = jwt.decode(token!) as UserJWT

  try {
    const recoverToken = crypto.randomBytes(32).toString('hex')
    const request = new mssql.Request()

    request.input('user_id', mssql.Int, user_id)
    request.input('recover_token', mssql.VarChar, recoverToken)
    await request.query(
      `insert into password_recovers (user_id, recover_token) values (@user_id, @recover_token)`
    )
    sendRecoverMail(email, recoverToken)
    res.send('ok').status(200).end()
  } catch (err) {
    console.log(err)
  }
})

export default router
