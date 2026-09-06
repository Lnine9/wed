import { cookies } from 'next/headers'
import { hasReplyAccess, REPLY_ACCESS_COOKIE } from '@/lib/reply-access'
import { readRsvps } from '@/lib/rsvps'

export const runtime = 'nodejs'

export async function GET() {
  const token = (await cookies()).get(REPLY_ACCESS_COOKIE)?.value
  if (!hasReplyAccess(token)) {
    return Response.json({ message: '请先输入查看口令。' }, { status: 401 })
  }

  try {
    const replies = await readRsvps()
    const summary = replies.reduce(
      (result, reply) => {
        result[reply.source] += reply.count
        return result
      },
      { 出阁: 0, 婚礼: 0 },
    )
    return Response.json({ replies, summary })
  } catch {
    return Response.json({ message: '暂时无法读取回执。' }, { status: 500 })
  }
}
