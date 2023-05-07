import express, { Router } from 'express'
import fs from 'fs'
import multer from 'multer'
import { getObjectFormattedResponse } from '../utils/format.js'
import validateJWT from '../middleware/validateJWT.js'

const router: Router = express.Router()

router.post('*', validateJWT)

router.use('/images', express.static('uploads/images'))

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = 'uploads/images/'
    fs.mkdirSync(path, { recursive: true })
    cb(null, path)
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const saveImages = multer({
  storage: imageStorage
})

const uploadImages = saveImages.array('image')

router.post('/images', (req, res) => {
  uploadImages(req, res, function (err) {
    if (!req.files) {
      res
        .json({ status: 400, error: 'No files were uploaded' })
        .status(400)
        .end()
      return
    }
    if (err) {
      console.log(err)
      res
        .json({ status: 500, error: 'Error uploading images' })
        .status(500)
        .end()
      return
    }
    const files = req.files as Express.Multer.File[]
    res
      .json(
        getObjectFormattedResponse(200, {
          images: files.map(
            (file) =>
              `${process.env.API_URL}/${file.path
                .replace(/\\/g, '/')
                .replace('uploads', 'media')}`
          )
        })
      )
      .status(200)
      .end()
  })
})

export default router
