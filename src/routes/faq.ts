import express from 'express'
import mssql from 'mssql'
import { getDBFormattedResponse } from '../utils/format.js'
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const result = await mssql.query(`select * from faq_questions`)
    console.log(result)
    res.json(getDBFormattedResponse(200, result.recordset)).status(200).end()
  } catch (err) {
    console.log(err)
  }
})

router.get('/id', async (req, res) => {
  try {
    const result = await mssql.query(`select * from question_id`)
    res.json(getDBFormattedResponse(200, result.recordset)).status(200).end()
  } catch (err) {
    console.log(err)
  }
})

export default router
