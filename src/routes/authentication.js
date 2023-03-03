import express from 'express'
import mssql from 'mssql'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/register', async (req, res) => {
  const { email, password } = req.body
  const regex = new RegExp(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/)
  try {
    const request = new mssql.Request()
    request.input('email', mssql.VarChar, email)

    const result = await request.query(
      `select * from usuarios where email = @email`
    )

    if (!email || !password) {
      res.json({ status: 400, error: 'Invalid data' }).status(400).end()
      return
    }

    if (result.recordset.length > 0) {
      res.json({ status: 409, error: 'User already exists' }).status(409).end()
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

    const hash = crypto.createHash('sha256').update(password).digest('hex')

    const insertRequest = new mssql.Request()
    insertRequest.input('email', mssql.VarChar, email)
    insertRequest.input('password', mssql.VarChar, hash)

    await insertRequest.query()

    res.json({ status: 200, message: 'User created' }).status(200).end()
  } catch (err) {
    console.log(err)
  }
})

router.post('/login', async (req, res) => {
  const { email, password, remember } = req.body
  try {
    const request = new mssql.Request()
    request.input('email', mssql.VarChar, email)
    request.input('password', mssql.VarChar, password)

    const result = await request.query(
      `select * from usuarios where email = @email and password = @password`
    )
    if (result.recordset.length > 0) {
      const { nombre, idUsuario } = result.recordset[0]
      const token = jwt.sign(
        { id: idUsuario, nombre },
        process.env.JWT_SECRET_KEY,
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
    } else {
      res.json({ status: 401, error: 'Invalid credentials' }).status(401)
    }
  } catch (err) {
    console.log(err)
  }
})

export default router
