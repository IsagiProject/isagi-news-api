import express from 'express'
import validateJWT from '../middleware/validateJWT.js'
import { getUserIdFromToken } from '../utils/user.js'
import mssql from 'mssql'
import { getDBFormattedResponse } from '../utils/format.js'

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

export default router
