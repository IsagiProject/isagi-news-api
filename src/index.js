import express from 'express'
import mssql from 'mssql'
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
    const result = await mssql.query`select * from noticias`
    res.json(getResponse(200, result.recordset)).status(200)
  } catch (err) {
    console.log(err)
  }
})

app.get('/autores/:id/noticias', async (req, res) => {
  try {
    const result =
      await mssql.query`select * from noticias where autor_id = ${req.params.id}`
    res.json(getResponse(200, result.recordset)).status(200)
  } catch (err) {
    console.error(err)
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

function getResponse(status, rows, err) {
  const response = {
    status,
    data: rows
  }
  if (err) {
    response.error = err
  }
}
