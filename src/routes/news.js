import express from 'express'
import mssql from 'mssql'

const router = express.Router()

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
    res.json(result.recordset)
  } catch (err) {
    console.log(err)
  }
})

export default router
