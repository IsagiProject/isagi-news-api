import mssql from 'mssql'
import crypto from 'crypto'

export async function userExistsWithEmail(email: string) {
  const request = new mssql.Request()
  request.input('email', mssql.VarChar, email)
  const res = await request.query(`select * from users where email = @email`)
  return res.recordset.length > 0
}

export function getHashedPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex')
}
