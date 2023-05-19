import express from 'express'
import validateJWT from '../middleware/validateJWT.js'
import { getUserIdFromToken } from '../utils/user.js'
import mssql from 'mssql'
import {
  getDBFormattedResponse,
  getErrorFormattedResponse,
  getSuccessfulFormatedResponse
} from '../utils/format.js'
import { isSaleLiked, saleExists } from '../utils/sales.js'

const router = express.Router()

router.use(validateJWT)

router.get('/sales/liked', async (req, res) => {
  const userId = getUserIdFromToken(req)
  const request = new mssql.Request()
  request.input('userId', mssql.Int, userId)
  const sales = await request.query(
    'select s.*, (select count(*) from sales_users_likes where sale_id = s.sale_id) likes from sales s join sales_users_likes su on su.sale_id = s.sale_id where su.user_id = @userId'
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
  const existsSale = await saleExists(saleId)
  if (!existsSale) {
    res
      .status(422)
      .json(getErrorFormattedResponse(422, 'Sale does not exist'))
      .end()
    return
  }

  const existsLike = await isSaleLiked(saleId, userId)
  if (existsLike) {
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

router.delete('/sales/liked', async (req, res) => {
  const userId = getUserIdFromToken(req)
  const { saleId } = req.body
  if (!saleId) {
    res.status(400).json(getErrorFormattedResponse(400, 'Invalid data')).end()
    return
  }
  const existsSale = await saleExists(saleId)
  if (!existsSale) {
    res
      .status(422)
      .json(getErrorFormattedResponse(422, 'Sale does not exist'))
      .end()
    return
  }

  const existsLike = await isSaleLiked(saleId, userId)
  if (!existsLike) {
    res
      .status(422)
      .json(getErrorFormattedResponse(422, 'Sale is not liked'))
      .end()
    return
  }

  const request = new mssql.Request()
  request.input('userId', mssql.Int, userId)
  request.input('saleId', mssql.Int, saleId)
  try {
    await request.query(
      'delete from sales_users_likes where sale_id = @saleId and user_id = @userId'
    )
    res
      .status(200)
      .json(getSuccessfulFormatedResponse(200, 'Sale unliked successfuly'))
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
