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
export default router
