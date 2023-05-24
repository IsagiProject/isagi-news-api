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

export function sendRecoverMail(mail: string, recoverToken: string) {
  const recoverMail = {
    from: process.env.EMAIL_FROM,
    to: '',
    subject: 'Recuperacion de contraseña',
    html: fs.readFileSync('./src/templates/recover_password.html', 'utf8')
  }

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

export function sendNewPasswordMail(mail: string, password: string) {
  const emailData = {
    from: process.env.EMAIL_FROM,
    to: '',
    subject: 'Nueva contraseña',
    html: fs.readFileSync('./src/templates/password_changed.html', 'utf8')
  }
  emailData.to = mail
  emailData.html = emailData.html.replace('{{password}}', password)

  transporter.sendMail(emailData, function (err, info) {
    if (err) throw err
    else console.log(info)
  })
}
