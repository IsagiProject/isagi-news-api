export type DBResponse = {
  status: number
  data: mssql.IRecordSet<any>
  error?: string
}
