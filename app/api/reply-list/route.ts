import { isValidReplyPasscode } from '@/lib/reply-access'
import { readRsvps } from '@/lib/rsvps'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: { passcode?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: '请求格式错误。' }, { status: 400 })
  }

  if (!isValidReplyPasscode(body.passcode)) {
    return Response.json({ message: '口令不正确。' }, { status: 401 })
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
