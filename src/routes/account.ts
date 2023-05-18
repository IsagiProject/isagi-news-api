import express from 'express'
import validateJWT from '../middleware/validateJWT.js'
import { getUserIdFromToken } from '../utils/user.js'
import mssql from 'mssql'
import {
  getDBFormattedResponse,
  getErrorFormattedResponse,
  getSuccessfulFormatedResponse
} from '../utils/format.js'

const router = express.Router()

router.use(validateJWT)

router.get('/sales/liked', async (req, res) => {
  const userId = getUserIdFromToken(req)
  const request = new mssql.Request()
  request.input('userId', mssql.Int, userId)
  const sales = await request.query(
    'select s.* from sales s join sales_users_likes su on su.sale_id = s.sale_id where su.user_id = @userId'
  )
  res.json(getDBFormattedResponse(200, sales.recordset)).status(200).end()
})

router.post('/sales/liked', async (req, res) => {
  const userId = getUserIdFromToken(req)
  const { saleId } = req.body
  if (!saleId) {
    res.status(400).json(getErrorFormattedResponse(400, 'Invalid data')).end()
    return
  }

  const existsSaleRequest = new mssql.Request()
  existsSaleRequest.input('saleId', mssql.Int, saleId)
  const existsSale = await existsSaleRequest.query(
    'select * from sales where sale_id = @saleId'
  )
  if (existsSale.recordset.length === 0) {
    res
      .status(422)
      .json(getErrorFormattedResponse(422, 'Sale does not exist'))
      .end()
    return
  }

  const existsLikeRequest = new mssql.Request()
  existsLikeRequest.input('userId', mssql.Int, userId)
  existsLikeRequest.input('saleId', mssql.Int, saleId)
  const existsLike = await existsLikeRequest.query(
    'select * from sales_users_likes where sale_id = @saleId and user_id = @userId'
  )
  if (existsLike.recordset.length > 0) {
    res
      .status(422)
      .json(getErrorFormattedResponse(422, 'Sale already liked'))
      .end()
    return
  }

  const request = new mssql.Request()
  request.input('userId', mssql.Int, userId)
  request.input('saleId', mssql.Int, saleId)
  try {
    await request.query(
      'insert into sales_users_likes (sale_id, user_id) values (@saleId, @userId)'
    )
    res
      .status(200)
      .json(getSuccessfulFormatedResponse(200, 'Sale liked successfuly'))
      .end()
  } catch (err) {
    console.log(err)
    res
      .status(500)
      .json(getErrorFormattedResponse(500, 'Internal server error'))
      .end()
  }
})

export default router
