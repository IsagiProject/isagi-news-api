import mssql from 'mssql'

export async function saleExists(saleId: number): Promise<boolean> {
  const existsSaleRequest = new mssql.Request()
  existsSaleRequest.input('saleId', mssql.Int, saleId)
  const existsSale = await existsSaleRequest.query(
    'select * from sales where sale_id = @saleId'
  )
  return existsSale.recordset.length > 0
}

export async function isSaleLiked(saleId: number, userId: number) {
  const existsLikeRequest = new mssql.Request()
  existsLikeRequest.input('userId', mssql.Int, userId)
  existsLikeRequest.input('saleId', mssql.Int, saleId)
  const existsLike = await existsLikeRequest.query(
    'select * from sales_users_likes where sale_id = @saleId and user_id = @userId'
  )
  return existsLike.recordset.length > 0
}
