import express from 'express'
import crypto from 'crypto'
import { Router } from 'express'
import validateJWT from '../middleware/validateJWT.js'
import isAdmin from '../middleware/isAdmin.js'
import mssql from 'mssql'
import {
  getDBFormattedResponse,
  getDefaultErrorMessage,
  getErrorFormattedResponse,
  getObjectFormattedResponse,
  getSuccessfulFormatedResponse
} from '../utils/format.js'
import { getHashedPassword, userExistsWithId } from '../utils/user.js'
import { sendNewPasswordMail } from '../utils/mailing.js'

const router: Router = express.Router()

router.use(validateJWT, isAdmin)

router.get('/users', (req, res) => {
  const request = new mssql.Request()
  request
    .query(
      'select user_id, username, email, admin, email_verified_at, blocked from users'
    )
    .then((result) => {
      res.json(getDBFormattedResponse(200, result.recordset)).status(200).end()
    })
    .catch((err) => {
      console.log(err)
      res.json(getDefaultErrorMessage()).status(500).end()
    })
})

router.put('/users/:id', async (req, res) => {
  const request = new mssql.Request()
  const { username, email, admin, blocked } = req.body

  const getUserRequest = new mssql.Request()
  getUserRequest.input('user_id', mssql.Int, req.params.id)
  const user = await getUserRequest
    .query('select * from users where user_id = @user_id')
    .then((result) => result.recordset[0])

  request.input('username', mssql.VarChar, username ? username : user.username)
  request.input('email', mssql.VarChar, email ? email : user.email)
  request.input('admin', mssql.Int, admin !== undefined ? admin : user.admin)
  request.input('blocked', mssql.Bit, blocked ? blocked : user.blocked)

  request
    .input('user_id', mssql.Int, req.params.id)
    .query(
      `update users set 
      username = @username, 
      email = @email,
      admin = @admin,
      blocked = @blocked
      where user_id = @user_id; 
      select user_id, username, email, admin, email_verified_at, blocked from users where user_id = @user_id`
    )
    .then((result) => {
      res
        .json(getObjectFormattedResponse(200, result.recordset[0]))
        .status(200)
        .end()
    })
    .catch((err) => {
      console.log(err)
      res.json(getDefaultErrorMessage()).status(500).end()
    })
})

router.post('/users/:id/reset-password', async (req, res) => {
  if (!userExistsWithId(parseInt(req.params.id))) {
    res.json({ status: 404, error: 'User not found' }).status(404).end()
  }

  const request = new mssql.Request()
  const randomPass = crypto.randomBytes(6).toString('hex')
  const hashedPass = getHashedPassword(randomPass)
  request.input('user_id', mssql.Int, req.params.id)
  request.input('password', mssql.VarChar, hashedPass)
  try {
    const dbRes = await request.query(
      `update users set password = @password where user_id = @user_id; select email from users where user_id = @user_id`
    )
    sendNewPasswordMail(dbRes.recordset[0].email, randomPass)
    res
      .json(getObjectFormattedResponse(200, { password: randomPass }))
      .status(200)
      .end()
  } catch (err) {
    console.log(err)
    res.json(getDefaultErrorMessage()).status(500).end()
  }
})

router.put('/sales/:id', async (req, res) => {
  const request = new mssql.Request()
  const { title, description, shop, link, oldPrice, newPrice } = req.body

  const getSaleRequest = new mssql.Request()
  getSaleRequest.input('sale_id', mssql.Int, req.params.id)
  const sale = await getSaleRequest
    .query('select * from sales where sale_id = @sale_id')
    .then((result) => result.recordset[0])
  request.input('title', mssql.VarChar, title ? title : sale.title)
  request.input(
    'description',
    mssql.VarChar,
    description ? description : sale.description
  )
  request.input('shop', mssql.VarChar, shop ? shop : sale.shop)
  request.input('link', mssql.VarChar, link ? link : sale.link)
  request.input('old_price', mssql.Float, oldPrice ? oldPrice : sale.old_price)
  request.input('new_price', mssql.Float, newPrice ? newPrice : sale.new_price)
  request
    .input('sale_id', mssql.Int, req.params.id)
    .query(
      `update sales set
      title = @title,
      description = @description,
      shop = @shop,
      link = @link,
      old_price = @old_price,
      new_price = @new_price
      where sale_id = @sale_id;
      select * from sales where sale_id = @sale_id`
    )
    .then((result) => {
      res
        .json(getObjectFormattedResponse(200, result.recordset[0]))
        .status(200)
        .end()
    })
    .catch((err) => {
      console.log(err)
      res.json(getDefaultErrorMessage()).status(500).end()
    })
})

router.delete('/sales/:id', async (req, res) => {
  const request = new mssql.Request()
  request.input('sale_id', mssql.Int, req.params.id)
  try {
    await request.query(`delete from sales where sale_id = @sale_id`)
    res
      .json(getSuccessfulFormatedResponse(200, 'Sale deleted'))
      .status(200)
      .end()
  } catch (err) {
    console.log(err)
    res.json(getDefaultErrorMessage()).status(500).end()
  }
})

router.post('/faq', async (req, res) => {
  const { question, answer } = req.body
  if (!question || !answer) {
    res.json(getErrorFormattedResponse(400, 'Invalid data')).status(400).end()
    return
  }
  const request = new mssql.Request()
  request.input('question', mssql.VarChar, question)
  request.input('answer', mssql.VarChar, answer)
  try {
    const result = await request.query(
      `insert into faq_questions (question, answer) values (@question, @answer); select @@identity as question_id`
    )
    res
      .json(getObjectFormattedResponse(200, result.recordset[0]))
      .status(200)
      .end()
  } catch (err) {
    console.log(err)
    res.json(getDefaultErrorMessage()).status(500).end()
  }
})

router.put('/faq/:id', async (req, res) => {
  const request = new mssql.Request()
  const { question, answer } = req.body

  const getFaqRequest = new mssql.Request()
  getFaqRequest.input('question_id', mssql.Int, req.params.id)
  const faq = await getFaqRequest
    .query('select * from faq_questions where question_id = @question_id')
    .then((result) => result.recordset[0])
  request.input('question', mssql.VarChar, question ? question : faq.question)
  request.input('answer', mssql.VarChar, answer ? answer : faq.answer)
  request
    .input('question_id', mssql.Int, req.params.id)
    .query(
      `update faq_questions set
      question = @question,
      answer = @answer
      where question_id = @question_id;
      select * from faq_questions where question_id = @question_id`
    )
    .then((result) => {
      res
        .json(getObjectFormattedResponse(200, result.recordset[0]))
        .status(200)
        .end()
    })
    .catch((err) => {
      console.log(err)
      res.json(getDefaultErrorMessage()).status(500).end()
    })
})

router.delete('/faq/:id', async (req, res) => {
  const request = new mssql.Request()
  request.input('question_id', mssql.Int, req.params.id)
  try {
    await request.query(
      `delete from faq_questions where question_id = @question_id`
    )
    res
      .json(getSuccessfulFormatedResponse(200, 'Question deleted'))
      .status(200)
      .end()
  } catch (err) {
    console.log(err)
    res.json(getDefaultErrorMessage()).status(500).end()
  }
})

export default router
