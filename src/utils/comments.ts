import mssql from 'mssql'

export async function getChildComments(commentId: number) {
  const request = new mssql.Request()
  request.input('id', mssql.Int, commentId)
  const result = await request.query(
    `select sc.*, concat('@', u.username) as username from sale_comments sc join users u on sc.user_id = u.user_id where sc.parent_id = @id order by sc.created_at desc`
  )
  for (const comment of result.recordset) {
    comment.child_comments = await getChildComments(comment.comment_id)
  }
  return result.recordset
}
