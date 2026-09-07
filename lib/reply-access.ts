const REPLY_ACCESS_PASSWORD = 'ymmlhn'

export function isValidReplyPasscode(value: unknown) {
  return typeof value === 'string' && value === REPLY_ACCESS_PASSWORD
}
