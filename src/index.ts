import express, { Request, Response } from 'express'
import mssql from 'mssql'
import dotenv from 'dotenv'
import authentication from './routes/auth.js'
import news from './routes/news.js'
import { getDBFormattedResponse } from './utils/format.js'

dotenv.config()

const app = express()
const port = 3000

const sqlConfig: mssql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST as string,
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

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.listen(port, () => {
  connectToDB()
  console.log(`Example app listening at http://localhost:${port}`)
})

app.use('/auth', authentication)
app.use('/noticias', news)

app.get('/noticias', async (req: Request, res: Response) => {
  try {
    const result = await mssql.query(`select * from noticias`)
    console.log(result)
    res.json(getDBFormattedResponse(200, result.recordset)).status(200).end()
  } catch (err) {
    console.log(err)
  }
})

app.get('/autores/:id/noticias', async (req: Request, res: Response) => {
  try {
    const request = new mssql.Request()
    request.input('id', mssql.Int, req.params.id)
    const result = await request.query(
      `select * from noticias where autor_id = @id`
    )
    res.json(getDBFormattedResponse(200, result.recordset)).status(200).end()
  } catch (err) {
    console.error(err)
  }
})

function connectToDB(): void {
  mssql.connect(sqlConfig, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log('Connected to DB')
    }
  })
}
