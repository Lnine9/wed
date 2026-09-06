'use client'

import { FormEvent, useState } from 'react'

type ReplySource = '婚礼' | '出阁'

type Reply = {
  count: number
  name: string
  source: ReplySource
}

type ReplyData = {
  replies: Reply[]
  summary: Record<ReplySource, number>
}

type ViewState = 'locked' | 'loading' | 'ready' | 'error'

export function ReplyListPage() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<ViewState>('locked')
  const [data, setData] = useState<ReplyData | null>(null)

  const unlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState('loading')
    setMessage('')

    try {
      const sessionResponse = await fetch('/api/reply-list/session', {
        body: JSON.stringify({ password }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const sessionResult = (await sessionResponse.json()) as { message?: string }
      if (!sessionResponse.ok) {
        throw new Error(sessionResult.message ?? '验证失败。')
      }

      const replyResponse = await fetch('/api/reply-list')
      const replyResult = (await replyResponse.json()) as ReplyData & { message?: string }
      if (!replyResponse.ok) {
        throw new Error(replyResult.message ?? '暂时无法读取回执。')
      }

      setData(replyResult)
      setState('ready')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : '验证失败。')
    }
  }

  if (state !== 'ready' || !data) {
    return (
      <main className="reply-list-page">
        <section className="reply-list-lock" aria-labelledby="reply-list-title">
          <p className="reply-list-lock__eyebrow">WEDDING REPLIES · PRIVATE LEDGER</p>
          <h1 id="reply-list-title">回执簿</h1>
          <p className="reply-list-lock__copy">输入查看口令，查阅宾客赴约信息。</p>
          <form className="reply-list-lock__form" onSubmit={unlock}>
            <label>
              <span>查看口令</span>
              <input
                autoComplete="current-password"
                disabled={state === 'loading'}
                name="password"
                placeholder="请输入口令"
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button disabled={state === 'loading'} type="submit">
              {state === 'loading' ? '验证中…' : '查阅回执'}
            </button>
          </form>
          {message && (
            <p aria-live="polite" className="reply-list-lock__message" role="alert">
              {message}
            </p>
          )}
        </section>
      </main>
    )
  }

  return (
    <main className="reply-list-page">
      <section className="reply-list-ledger" aria-labelledby="reply-list-title">
        <header className="reply-list-ledger__header">
          <div>
            <p>WEDDING REPLIES · PRIVATE LEDGER</p>
            <h1 id="reply-list-title">赴约回执簿</h1>
          </div>
          <span>{data.replies.length} 份回执</span>
        </header>

        <div className="reply-list-summary" aria-label="来源人数汇总">
          <article className="reply-list-summary__item reply-list-summary__item--wedding">
            <p>婚礼</p>
            <strong>{data.summary.婚礼}</strong>
            <span>人已回执</span>
          </article>
          <article className="reply-list-summary__item reply-list-summary__item--farewell">
            <p>出阁</p>
            <strong>{data.summary.出阁}</strong>
            <span>人已回执</span>
          </article>
        </div>

        <div className="reply-list-table-wrap">
          <table>
            <caption className="sr-only">宾客回执明细</caption>
            <thead>
              <tr>
                <th scope="col">序号</th>
                <th scope="col">姓名</th>
                <th scope="col">人数</th>
                <th scope="col">来源</th>
              </tr>
            </thead>
            <tbody>
              {data.replies.length ? (
                data.replies.map((reply, index) => (
                  <tr key={`${reply.source}-${reply.name}-${index}`}>
                    <td>{String(index + 1).padStart(2, '0')}</td>
                    <td>{reply.name}</td>
                    <td>{reply.count}</td>
                    <td>
                      <span className={`reply-list-source reply-list-source--${reply.source}`}>
                        {reply.source}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="reply-list-empty" colSpan={4}>
                    暂无回执
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
