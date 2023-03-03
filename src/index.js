import express from 'express'
import mssql from 'mssql'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
const port = 3000

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

app.listen(port, () => {
  connectToDB()
  console.log(`Example app listening at http://localhost:${port}`)
})

app.get('/noticias', async (req, res) => {
  try {
    const result = await mssql.query(`select * from noticias`)
    console.log(result)
    res.json(getDBFormattedResponse(200, result.recordset)).status(200)
  } catch (err) {
    console.log(err)
  }
})

app.get('/autores/:id/noticias', async (req, res) => {
  try {
    const result = await mssql.query(
      `select * from noticias where autor_id = ?`,
      req.params.id
    )
    res.json(getDBFormattedResponse(200, result.recordset)).status(200)
  } catch (err) {
    console.error(err)
  }
})

app.get('/noticias/tipos/:tipo', async (req, res) => {
  try {
    const result =
      await mssql.query`select * from noticias where tipo = ${req.params.tipo}`
    console.log(result)
    res.json(result.recordset)
  } catch (err) {
    console.log(err)
  }
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const result =
      await mssql.query`select * from usuarios where email = ${email} and password = ${password}`
    if (result.recordset.length > 0) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
        expiresIn: '24h'
      })
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

app.post('/register', async (req, res) => {
  const { email, password } = req.body

  try {
  } catch (err) {
    console.log(err)
  }
})

function connectToDB() {
  mssql.connect(sqlConfig, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log('Connected to DB')
    }
  })
}

function getDBFormattedResponse(status, rows, err) {
  const response = {
    status,
    data: rows
  }
  if (err) {
    response.error = err
  }
  return response
}
