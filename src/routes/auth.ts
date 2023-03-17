import express, { Router } from 'express'
import mssql from 'mssql'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { sendRecoverMail } from '../utils/mailing.js'
import { getHashedPassword, userExistsWithEmail } from '../utils/user.js'
import {
  getDefaultErrorMessage,
  getErrorFormattedResponse,
  getSuccessfulFormatedResponse
} from '../utils/format.js'

const router: Router = express.Router()

router.post('/register', async (req, res) => {
  const { email, password } = req.body
  const regex = new RegExp(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/)
  try {
    const request = new mssql.Request()
    request.input('email', mssql.VarChar, email)

    const result = await request.query(
      `select * from users where email = @email`
    )

    if (!email || !password) {
      res.json({ status: 400, error: 'Invalid data' }).status(400).end()
      return
    }

    if (result.recordset.length > 0) {
      res.json({ status: 422, error: 'User already exists' }).status(422).end()
      return
    }

    if (!regex.test(email)) {
      res.json({ status: 400, error: 'Invalid email' }).status(400).end()
      return
    }

    if (password.length < 9) {
      res.json({ status: 400, error: 'Invalid password' }).status(400).end()
      return
    }

    const hash = getHashedPassword(password)

    const insertRequest = new mssql.Request()
    insertRequest.input('email', mssql.VarChar, email)
    insertRequest.input('password', mssql.VarChar, hash)

    await insertRequest.query(
      'insert into usuarios (email, password) values (@email, @password) '
    )
    res
      .json(getSuccessfulFormatedResponse(200, 'User created'))
      .status(200)
      .end()
  } catch (err) {
    console.log(err)
    res.json(getDefaultErrorMessage()).status(500).end()
  }
})

router.post('/login', async (req, res) => {
  const { email, password, remember } = req.body
  try {
    const request = new mssql.Request()
    request.input('email', mssql.VarChar, email)
    request.input('password', mssql.VarChar, password)

    const result = await request.query(
      `select * from users where email = @email and password = @password`
    )
    if (result.recordset.length > 0) {
      const { user_id, name } = result.recordset[0]
      const token = jwt.sign(
        { user_id, name, email },
        process.env.JWT_SECRET_KEY!,
        {
          expiresIn: remember ? '1y' : '1h'
        }
      )
      res
        .json({
          status: 200,
          token
        })
        .status(200)
        .end()
      return
    }
    res
      .json(getErrorFormattedResponse(401, 'Invalid credentials'))
      .status(401)
      .end()
  } catch (err) {
    res.json(getDefaultErrorMessage()).status(500).end()
    console.log(err)
  }
})

router.post('/request-recover', async (req, res) => {
  const { email } = req.body

  try {
    const userExists = await userExistsWithEmail(email)
    if (!userExists) {
      res
        .send(getErrorFormattedResponse(404, 'User not found'))
        .status(404)
        .end()
      return
    }

    const recoverToken = crypto.randomBytes(32).toString('hex')
    const request = new mssql.Request()

    request.input('email', mssql.VarChar, email)
    request.input('recover_token', mssql.VarChar, recoverToken)
    await request.query(
      `insert into password_recovers (user_id, recover_token) values ((select user_id from users where email=@email), @recover_token)`
    )
    sendRecoverMail(email, recoverToken)
    res
      .send(getSuccessfulFormatedResponse(200, 'Recover email sent'))
      .status(200)
      .end()
  } catch (err) {
    res.json(getDefaultErrorMessage()).status(500).end()
    console.log(err)
  }
})

router.post('/recover', async (req, res) => {
  const { email, token, password } = req.body
  if (!email || !token || !password) {
    res.json({ status: 400, error: 'Invalid data' }).status(400).end()
    return
  }

  try {
    const emailExists = await userExistsWithEmail(email)

    if (!emailExists) {
      res
        .json(getErrorFormattedResponse(404, 'User not found'))
        .status(404)
        .end()
    }

    const recoverIsValidRequest = new mssql.Request()
    recoverIsValidRequest.input('email', mssql.VarChar, email)
    recoverIsValidRequest.input('token', mssql.VarChar, token)

    // Solo valido si ha pasado menos de 1 dia / 24 horas
    const recoverValidResponse = await recoverIsValidRequest.query(
      'select * from password_recovers where user_id = (select user_id from users where email = @email) and recover_token = @token and recovered_at IS NULL and  DATEDIFF(day, created_at, CURRENT_TIMESTAMP) < 1'
    )

    if (recoverValidResponse.recordset.length === 0) {
      res
        .json(
          getErrorFormattedResponse(400, 'No password reocvery request found')
        )
        .status(400)
        .end()
      return
    }

    const recoverRequest = new mssql.Request()
    recoverRequest.input(
      'recover_id',
      mssql.Int,
      recoverValidResponse.recordset[0].recover_id
    )
    recoverRequest.query(
      'update password_recovers set recovered_at = CURRENT_TIMESTAMP where recover_id = @recover_id'
    )

    const passwordChangeRequest = new mssql.Request()
    passwordChangeRequest.input(
      'user_id',
      mssql.Int,
      recoverValidResponse.recordset[0].user_id
    )
    const hash = getHashedPassword(password)
    passwordChangeRequest.input('password', mssql.VarChar, hash)
    passwordChangeRequest.query(
      'update users set password = @password where user_id = @user_id'
    )

    res.json(getSuccessfulFormatedResponse(200, 'Password changed')).end()
  } catch (err) {
    console.log(err)
    res.json(getDefaultErrorMessage()).status(500).end()
  }
})

export default router
