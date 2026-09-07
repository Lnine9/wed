import { appendRsvp, deleteRsvp, normalizeReplySource, updateRsvp } from '@/lib/rsvps'

export const runtime = 'nodejs'

type RsvpPayload = {
  index?: unknown
  count?: unknown
  name?: unknown
  source?: unknown
}

function parseReply(body: RsvpPayload) {
  const trimmedName = typeof body.name === 'string' ? body.name.trim() : ''
  if (!trimmedName || trimmedName.length > 40) {
    return { error: '姓名不能为空且最多 40 个字符。' as const }
  }
  if (!Number.isInteger(body.count) || (body.count as number) < 1) {
    return { error: '人数必须是大于等于 1 的整数。' as const }
  }
  return {
    reply: {
      count: body.count as number,
      name: trimmedName,
      source: normalizeReplySource(body.source) ?? '婚礼',
    },
  }
}

async function parseBody(request: Request) {
  try {
    return { body: (await request.json()) as RsvpPayload }
  } catch {
    return { error: Response.json({ message: '请求格式错误。' }, { status: 400 }) }
  }
}

function parseIndex(value: unknown) {
  if (!Number.isInteger(value) || (value as number) < 0) return null
  return value as number
}

export async function POST(request: Request) {
  let body: { count?: unknown; name?: unknown; source?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: '请求格式错误。' }, { status: 400 })
  }

  const { count, name, source } = body
  const trimmedName = typeof name === 'string' ? name.trim() : ''
  const normalizedSource = normalizeReplySource(source)
  if (!trimmedName || trimmedName.length > 40) {
    return Response.json({ message: '姓名不能为空且最多 40 个字符。' }, { status: 400 })
  }
  if (!Number.isInteger(count) || (count as number) < 1) {
    return Response.json({ message: '人数必须是大于等于 1 的整数。' }, { status: 400 })
  }
  if (!normalizedSource) {
    return Response.json({ message: '来源无效。' }, { status: 400 })
  }

  try {
    await appendRsvp({ count: count as number, name: trimmedName, source: normalizedSource })
    return Response.json({ ok: true }, { status: 201 })
  } catch {
    return Response.json({ message: '暂时无法保存回执，请稍后再试。' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const parsedBody = await parseBody(request)
  if ('error' in parsedBody) return parsedBody.error
  const { body } = parsedBody

  const index = parseIndex(body.index)
  if (index === null) {
    return Response.json({ message: '回执序号无效。' }, { status: 400 })
  }
  const parsed = parseReply(body)
  if ('error' in parsed) {
    return Response.json({ message: parsed.error }, { status: 400 })
  }

  try {
    const updated = await updateRsvp(index, parsed.reply!)
    if (!updated) {
      return Response.json({ message: '该回执不存在。' }, { status: 404 })
    }
    return Response.json({ ok: true })
  } catch {
    return Response.json({ message: '暂时无法保存修改，请稍后再试。' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const parsedBody = await parseBody(request)
  if ('error' in parsedBody) return parsedBody.error
  const { body } = parsedBody

  const index = parseIndex(body.index)
  if (index === null) {
    return Response.json({ message: '回执序号无效。' }, { status: 400 })
  }

  try {
    const removed = await deleteRsvp(index)
    if (!removed) {
      return Response.json({ message: '该回执不存在。' }, { status: 404 })
    }
    return Response.json({ ok: true })
  } catch {
    return Response.json({ message: '暂时无法删除回执，请稍后再试。' }, { status: 500 })
  }
}
