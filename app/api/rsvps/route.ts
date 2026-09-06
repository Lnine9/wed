import { mkdir, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { normalizeReplySource, readRsvps, type Rsvp } from '@/lib/rsvps'

export const runtime = 'nodejs'

const DATA_DIRECTORY = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIRECTORY, 'rsvps.json')

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: '请求格式错误。' }, { status: 400 })
  }

  const { count, name, source } = body as Partial<Rsvp>
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

  const validatedCount = count as number

  try {
    await mkdir(DATA_DIRECTORY, { recursive: true })
    const rsvps = await readRsvps()
    rsvps.push({ count: validatedCount, name: trimmedName, source: normalizedSource })
    const temporaryFile = `${DATA_FILE}.${crypto.randomUUID()}.tmp`
    await writeFile(temporaryFile, `${JSON.stringify(rsvps, null, 2)}\n`, 'utf8')
    await rename(temporaryFile, DATA_FILE)
    return Response.json({ ok: true }, { status: 201 })
  } catch {
    return Response.json({ message: '暂时无法保存回执，请稍后再试。' }, { status: 500 })
  }
}
