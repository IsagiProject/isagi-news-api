import express from 'express'
import { sendRecoverMail } from '../utils/mailing.js'

const router = express.Router()

router.post('/recover', async (req, res) => {
  const { email } = req.body

  try {
    sendRecoverMail(email)
    res.send('ok').status(200).end()
  } catch (err) {
    console.log(err)
  }
})

export default router
