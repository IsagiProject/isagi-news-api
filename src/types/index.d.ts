export type DBResponse = {
  status: number
  data: mssql.IRecordSet<any>
  total?: number
  error?: string
}

export type ErrorRosponse = {
  status: number
  error: string
}

export type UserJWT = {
  user_id: number
  username: string
  email: string
  admin: boolean
  iat: number
  exp: number
}

export type sqlOrdersType = {
  [key: string]: string
}
