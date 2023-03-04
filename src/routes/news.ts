import express, { Router } from 'express'
import mssql from 'mssql'
import { getDBFormattedResponse } from '../utils/format.js'

const router: Router = express.Router()

router.get('/tipos/:tipo', async (req, res) => {
  try {
    const request = new mssql.Request()
    request.input('tipo', mssql.VarChar, req.params.tipo)
    const result = await request.query(
      `select * from noticias where idNoticia in (
        select idNoticia from tipos_noticias where idTipo in (
          select idTipo from tipos where nombre = @tipo
        )
      )`
    )
    res.json(getDBFormattedResponse(200, result.recordset)).status(200).end()
  } catch (err) {
    console.log(err)
  }
})

export default router
