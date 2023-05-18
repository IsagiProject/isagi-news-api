import express, { Request, Response } from 'express'
import mssql from 'mssql'
import dotenv from 'dotenv'
import authentication from './routes/auth.js'
import news from './routes/news.js'
import sales from './routes/sales.js'
import authors from './routes/authors.js'
import account from './routes/account.js'
import faq from './routes/faq.js'
import media from './routes/media.js'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'

dotenv.config()

const app = express()
const port = process.env.APP_PORT
const swaggerDocument = JSON.parse(
  fs.readFileSync('./docs/swagger.json', 'utf8')
)

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
app.disable('x-powered-by')

app.use((req, res, next) => {
  //req.setEncoding('utf8')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  next()
})

app.listen(port, () => {
  connectToDB()
  console.log(`App listening at http://localhost:${port}`)
})

app.get('/', (req, res) => {
  res.send('ISAGI API IS UP!')
})
app.use('/auth', authentication)
app.use('/news', news)
app.use('/sales', sales)
app.use('/authors', authors)
app.use('/account', account)
app.use('/faq', faq)
app.use('/media', media)

app.use('/docs', swaggerUi.serve)
app.get('/docs', swaggerUi.setup(swaggerDocument))

function connectToDB(): void {
  mssql.connect(sqlConfig, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log('Connected to DB')
    }
  })
}
