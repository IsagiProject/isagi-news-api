import express, { Router } from 'express'
import mssql from 'mssql'
import validateJWT from '../middleware/validateJWT.js'
import {
  getDBFormattedResponse,
  getDefaultErrorMessage,
  getSuccessfulFormatedResponse
} from '../utils/format.js'
import jwt from 'jsonwebtoken'
import { UserJWT } from '../types/index.js'

const router: Router = express.Router()

router.post('*', validateJWT)

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
    } else if (order === 'title') {
      result = await request.query(
        `select s.*, concat('@', u.name) as username from sales s join users u on s.user_id = u.user_id order by title`
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
    res.json(getDefaultErrorMessage()).status(500)
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
    res.json(getDefaultErrorMessage()).status(500)
    console.log(err)
  }
})

router.get('/:id/comments', async (req, res) => {
  try {
    const request = new mssql.Request()
    request.input('id', mssql.Int, req.params.id)
    const result = await request.query(
      `select sc.*, concat('@', u.name) as username from sale_comments sc join users u on sc.user_id = u.user_id where sc.sale_id = @id`
    )
    res.json(getDBFormattedResponse(200, result.recordset)).status(200).end()
  } catch (err) {
    res.json(getDefaultErrorMessage()).status(500)
    console.log(err)
  }
})

router.post('/:id/comments', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    const data = jwt.decode(token!) as UserJWT
    const request = new mssql.Request()
    request.input('sale_id', mssql.Int, req.params.id)
    request.input('user_id', mssql.Int, data.user_id)
    request.input('text', mssql.VarChar, req.body.comment)
    await request.query(
      'insert into sale_comments (sale_id, user_id, text, parent_id) values (@sale_id, @user_id, @text, null)'
    )
    res
      .json(getSuccessfulFormatedResponse(200, 'Comment added'))
      .status(200)
      .end()
  } catch (err) {
    res.json(getDefaultErrorMessage()).status(500)
    console.log(err)
  }
})

export default router
