import { NextResponse } from 'next/server'
import {
  createReplyAccessToken,
  isReplyPasswordValid,
  REPLY_ACCESS_COOKIE,
} from '@/lib/reply-access'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: { password?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: '请求格式错误。' }, { status: 400 })
  }

  if (!isReplyPasswordValid(body.password)) {
    return Response.json({ message: '口令不正确。' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(REPLY_ACCESS_COOKIE, createReplyAccessToken(), {
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  })
  return response
}
