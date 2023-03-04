import mssql from 'mssql'
import { DBResponse } from '../types'

export function getDBFormattedResponse(
  status: number,
  rows: mssql.IRecordSet<any>,
  err?: string
): DBResponse {
  const response: DBResponse = {
    status,
    data: rows
  }
  if (err) {
    response.error = err
  }
  return response
}
