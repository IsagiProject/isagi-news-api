import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import fs from 'fs'
import crypto from 'crypto'

dotenv.config()

export const transporter = nodemailer.createTransport({
  port: process.env.SMTP_PORT as any,
  host: process.env.SMTP_HOST,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  secure: true
})

const recoverMail = {
  from: process.env.EMAIL_FROM,
  to: '',
  subject: 'Recuperacion de contraseña',
  html: fs.readFileSync('./src/templates/recover_password.html', 'utf8')
}

export function sendRecoverMail(mail: string, recoverToken: string) {
  recoverMail.to = mail
  recoverMail.html = recoverMail.html
    .replace('{{email}}', mail)
    .replace('{{token}}', recoverToken)

  transporter.sendMail(recoverMail, function (err, info) {
    if (err) throw err
    else console.log(info)
  })
}
