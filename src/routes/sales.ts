import express, { Router } from 'express'
import mssql from 'mssql'
import { getDBFormattedResponse } from '../utils/format.js'

const router: Router = express.Router()

router.get('/', async (req, res) => {
  const order = req.query.order
  const filter = req.query.filter
  let result: mssql.IResult<any>
  try {
    const request = new mssql.Request()
    if (order === 'date') {
      result = await request.query(
        `select s.*, concat('@', u.name) as username from sales s join users u on s.user_id = u.user_id  order by created_at`
      )
    } else if (order === 'price') {
      result = await request.query(
        `select s.*, concat('@', u.name) as username from sales s join users u on s.user_id = u.user_id  order by new_price`
      )
    } else if (order === 'name') {
      result = await request.query(
        `select s.*, concat('@', u.name) as username from sales s join users u on s.user_id = u.user_id order by name`
      )
    } else if (order === 'discount') {
      result = await request.query(
        `select s.*, concat('@', u.name) as username from sales s join users u on s.user_id = u.user_id
     order by (new_price / old_price)`
      )
    } else {
      result = await request.query(
        `select s.*, concat('@', u.name) as username from sales s join users u on s.user_id = u.user_id order by sale_id`
      )
    }
    res.json(getDBFormattedResponse(200, result.recordset)).status(200).end()
  } catch (err) {
    console.log(err)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const request = new mssql.Request()
    request.input('id', mssql.Int, req.params.id)
    const result = await request.query(
      `select s.*, concat('@', u.name) as username from sales s join users u on s.user_id = u.user_id where s.sale_id = @id`
    )
    res.json(getDBFormattedResponse(200, result.recordset)).status(200).end()
  } catch (err) {
    console.log(err)
  }
})

export default router
