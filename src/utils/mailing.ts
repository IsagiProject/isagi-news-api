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
    .replace('{{url}}', process.env.WEB_URL as string)
    .replace('{{recoverPath}}', process.env.PASSWORD_RECOVER_PATH as string)  

  transporter.sendMail(recoverMail, function (err, info) {
    if (err) throw err
    else console.log(info)
  })
}

const confirmMail = {
  from: process.env.EMAIL_FROM,
  to: '',
  subject: 'Verificar cuenta',
  html: fs.readFileSync('./src/templates/verified_email.html', 'utf8')
}
export function sendConfirmationMail(mail: string, confirmToken: string) {
  confirmMail.to = mail
  confirmMail.html = confirmMail.html
    .replace('{{email}}', mail)
    .replace('{{token}}', confirmToken)
    .replace('{{url}}', process.env.WEB_URL as string)
    .replace('{{recoverPath}}', process.env.EMAIL_CONFIRM_PATH as string)  

  transporter.sendMail(confirmMail, function (err, info) {
    if (err) throw err
    else console.log(info)
  })
}
