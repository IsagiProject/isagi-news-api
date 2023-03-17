import mssql from 'mssql'

export async function userExistsWithEmail(email: string) {
  const request = new mssql.Request()
  request.input('email', mssql.VarChar, email)
  const res = await request.query(`select * from users where email = @email`)
  return res.recordset.length > 0
}
