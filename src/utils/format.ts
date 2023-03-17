import mssql from 'mssql'
import { DBResponse, ErrorRosponse } from '../types'

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

export function getErrorFormattedResponse(
  status: number,
  error: string
): ErrorRosponse {
  return {
    status,
    error
  }
}

export function getSuccessfulFormatedResponse(status: number, message: string) {
  return {
    status,
    message
  }
}

export function getDefaultErrorMessage() {
  return {
    status: 500,
    error: 'Something went wrong'
  }
}
