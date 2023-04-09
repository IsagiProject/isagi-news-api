import express, { Request, Response, Router } from 'express'
import mssql from 'mssql'
import { getDBFormattedResponse } from '../utils/format.js'

const router: Router = express.Router()

router.get('/:id/news', async (req: Request, res: Response) => {
  try {
    const request = new mssql.Request()
    request.input('id', mssql.Int, req.params.id)
    const result = await request.query(
      `select * from news where author_id = @id`
    )
    res.json(getDBFormattedResponse(200, result.recordset)).status(200).end()
  } catch (err) {
    console.error(err)
  }
})

export default router
