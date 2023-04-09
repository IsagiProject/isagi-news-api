import express from 'express'
import validateJWT from '../middleware/validateJWT.js'

const router = express.Router()

router.use(validateJWT)

export default router
