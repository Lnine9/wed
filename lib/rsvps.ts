import { readFile } from 'node:fs/promises'
import path from 'node:path'

export type ReplySource = '婚礼' | '出阁'

export type Rsvp = {
  count: number
  name: string
  source: ReplySource
}

type StoredRsvp = {
  count?: unknown
  name?: unknown
  source?: unknown
}

const DATA_FILE = path.join(process.cwd(), 'data', 'rsvps.json')

export function normalizeReplySource(source: unknown): ReplySource | null {
  if (source === '婚礼' || source === '主页') return '婚礼'
  if (source === '出阁' || source === 'cover2') return '出阁'
  return null
}

export async function readRsvps(): Promise<Rsvp[]> {
  try {
    const content = await readFile(DATA_FILE, 'utf8')
    const value: unknown = JSON.parse(content)
    if (!Array.isArray(value)) return []

    return value.flatMap((item: StoredRsvp) => {
      const source = normalizeReplySource(item?.source)
      const name = typeof item?.name === 'string' ? item.name.trim() : ''
      const count = item?.count
      if (!source || !name || !Number.isInteger(count) || (count as number) < 1) {
        return []
      }
      return [{ count: count as number, name, source }]
    })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}
