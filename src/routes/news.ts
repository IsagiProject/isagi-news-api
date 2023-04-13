import express, { Request, Response, Router } from 'express'
import mssql from 'mssql'
import {
  getDBFormattedResponse,
  getDefaultErrorMessage,
  getErrorFormattedResponse
} from '../utils/format.js'

const router: Router = express.Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await mssql.query(`select * from news`)
    console.log(result)
    res.json(getDBFormattedResponse(200, result.recordset)).status(200).end()
  } catch (err) {
    res.json(getDefaultErrorMessage()).status(500).end()
    console.log(err)
  }
})

router.get('/types', async (req: Request, res: Response) => {
  try {
    const result = await mssql.query(`select * from types`)
    res.json(getDBFormattedResponse(200, result.recordset)).status(200).end()
  } catch (err) {
    res.json(getDefaultErrorMessage()).status(500).end()
    console.log(err)
  }
})

router.get('/types/:type', async (req: Request, res: Response) => {
  try {
    const request = new mssql.Request()
    request.input('type', mssql.VarChar, req.params.type)
    const result = await request.query(
      `select * from news where news_id in (
        select news_id from types_news where type_id in (
          select type_id from types where LOWER(name) = LOWER(@type)
        )
      )`
    )
    res.json(getDBFormattedResponse(200, result.recordset)).status(200).end()
  } catch (err) {
    res.json(getDefaultErrorMessage()).status(500).end()
    console.log(err)
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const request = new mssql.Request()
    request.input('id', mssql.Int, req.params.id)
    const result = await request.query(`select * from news where news_id = @id`)
    if (result.recordset.length === 0) {
      res
        .json(
          getErrorFormattedResponse(
            404,
            `Not found news with id ${req.params.id}`
          )
        )
        .status(404)
        .end()
      return
    }
    res.json(getDBFormattedResponse(200, result.recordset[0])).status(200).end()
  } catch (err) {
    res.json(getDefaultErrorMessage).status(500).end()
    console.log(err)
  }
})

export default router
