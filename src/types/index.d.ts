export type DBResponse = {
  status: number
  data: mssql.IRecordSet<any>
  error?: string
}

export type ErrorRosponse = {
  status: number
  error: string
}

export type UserJWT = {
  user_id: number
  name: string
  email: string
}
