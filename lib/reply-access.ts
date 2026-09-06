import { createHmac, timingSafeEqual } from 'node:crypto'

export const REPLY_ACCESS_COOKIE = 'reply_list_access'
const REPLY_ACCESS_PASSWORD = 'ymmlhn'

function tokenFor(password: string) {
  return createHmac('sha256', REPLY_ACCESS_PASSWORD)
    .update(password)
    .digest('hex')
}

export function isReplyPasswordValid(password: unknown) {
  return typeof password === 'string' && password === REPLY_ACCESS_PASSWORD
}

export function createReplyAccessToken() {
  return tokenFor(REPLY_ACCESS_PASSWORD)
}

export function hasReplyAccess(token: string | undefined) {
  if (!token) return false
  const expected = Buffer.from(createReplyAccessToken())
  const received = Buffer.from(token)
  return received.length === expected.length && timingSafeEqual(received, expected)
}
