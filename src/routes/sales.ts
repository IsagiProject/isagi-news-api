import express, { Router } from 'express'
import mssql from 'mssql'
import validateJWT from '../middleware/validateJWT.js'
import {
  getDBFormattedResponse,
  getDefaultErrorMessage,
  getObjectFormattedResponse
} from '../utils/format.js'
import jwt from 'jsonwebtoken'
import { UserJWT } from '../types/index.js'
import { getChildComments } from '../utils/comments.js'
import { getUserIdFromToken } from '../utils/user.js'

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
        `select s.*, concat('@', u.username) as username from sales s join users u on s.user_id = u.user_id  order by created_at`
      )
    } else if (order === 'price') {
      result = await request.query(
        `select s.*, concat('@', u.username) as username from sales s join users u on s.user_id = u.user_id  order by new_price`
      )
    } else if (order === 'title') {
      result = await request.query(
        `select s.*, concat('@', u.username) as username from sales s join users u on s.user_id = u.user_id order by title`
      )
    } else if (order === 'discount') {
      result = await request.query(
        `select s.*, concat('@', u.username) as username from sales s join users u on s.user_id = u.user_id
     order by (new_price / old_price)`
      )
    } else {
      result = await request.query(
        `select s.*, concat('@', u.username) as username from sales s join users u on s.user_id = u.user_id order by sale_id`
      )
    }
    res.json(getDBFormattedResponse(200, result.recordset)).status(200).end()
  } catch (err) {
    res.json(getDefaultErrorMessage()).status(500).end()
    console.log(err)
  }
})

router.post('/', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req)
    const request = new mssql.Request()
    request.input('title', mssql.VarChar, req.body.title)
    request.input('description', mssql.VarChar, req.body.description)
    request.input('image', mssql.VarChar, req.body.image)
    request.input('shop', mssql.VarChar, req.body.shop)
    request.input('link', mssql.VarChar, req.body.link)
    request.input('old_price', mssql.Float, req.body.old_price)
    request.input('new_price', mssql.Float, req.body.new_price)
    request.input('user_id', mssql.Int, userId)
    const result = await request.query(
      `insert into sales (title, description, image, shop, link, old_price, new_price, user_id) values (@title, @description, @image, @shop, @link, @old_price, @new_price, @user_id); select @@identity as sale_id`
    )
    res
      .json(getObjectFormattedResponse(200, { sale_id: result.recordset[0] }))
      .status(200)
      .end()
  } catch (err) {
    res.json(getDefaultErrorMessage()).status(500).end()
    console.log(err)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const request = new mssql.Request()
    request.input('id', mssql.Int, req.params.id)
    const result = await request.query(
      `select s.*, concat('@', u.username) as username from sales s join users u on s.user_id = u.user_id where s.sale_id = @id`
    )
    res.json(getDBFormattedResponse(200, result.recordset[0])).status(200).end()
  } catch (err) {
    res.json(getDefaultErrorMessage()).status(500).end()
    console.log(err)
  }
})

router.get('/:id/comments', async (req, res) => {
  try {
    const request = new mssql.Request()
    request.input('id', mssql.Int, req.params.id)
    const result = await request.query(
      `select sc.*, concat('@', u.username) as username from sale_comments sc join users u on sc.user_id = u.user_id where sc.sale_id = @id and parent_id is null order by sc.created_at desc`
    )
    const totalRequest = new mssql.Request()
    totalRequest.input('id', mssql.Int, req.params.id)
    const totalResult = await totalRequest.query(
      `select count(*) as total from sale_comments where sale_id = @id`
    )
    for (let i = 0; i < result.recordset.length; i++) {
      result.recordset[i].child_comments = await getChildComments(
        result.recordset[i].comment_id
      )
    }
    const responseJson = getDBFormattedResponse(200, result.recordset)
    responseJson.total = totalResult.recordset[0].total
    res.json(responseJson).status(200).end()
  } catch (err) {
    res.json(getDefaultErrorMessage()).status(500).end()
    console.log(err)
  }
})

router.post('/:id/comments', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    const data = jwt.decode(token!) as UserJWT
    const request = new mssql.Request()
    request.input('sale_id', mssql.Int, req.params.id)
    request.input('parent_id', mssql.Int, req.body.parentId)
    request.input('user_id', mssql.Int, data.user_id)
    request.input('text', mssql.NVarChar, req.body.comment)
    const result = await request.query(
      'insert into sale_comments (sale_id, user_id, text, parent_id) OUTPUT inserted.comment_id values (@sale_id, @user_id, @text, @parent_id)'
    )
    res
      .json(
        getObjectFormattedResponse(200, {
          commentId: result.recordset[0].comment_id
        })
      )
      .status(200)
      .end()
  } catch (err) {
    res.json(getDefaultErrorMessage()).status(500).end()
    console.log(err)
  }
})

export default router
