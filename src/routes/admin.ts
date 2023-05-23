import express from 'express'
import { Router } from 'express'
import validateJWT from '../middleware/validateJWT.js'
import isAdmin from '../middleware/isAdmin.js'
import mssql from 'mssql'
import { getDBFormattedResponse } from '../utils/format.js'

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
      res
        .json({ status: 500, error: 'Internal server error' })
        .status(500)
        .end()
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
  request.input('admin', mssql.Int, admin ? admin : user.admin)
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
        .json(getDBFormattedResponse(200, result.recordset[0]))
        .status(200)
        .end()
    })
    .catch((err) => {
      console.log(err)
      res
        .json({ status: 500, error: 'Internal server error' })
        .status(500)
        .end()
    })
})
export default router
