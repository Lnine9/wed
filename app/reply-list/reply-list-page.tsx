'use client'

import { FormEvent, useRef, useState } from 'react'

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

type SheetState =
  | { mode: 'actions'; index: number }
  | { mode: 'edit'; index: number }
  | { mode: 'delete'; index: number }
  | null

const LONG_PRESS_MS = 480

function describeReply(reply: Reply) {
  return `「${reply.name} · ${reply.count}人 · ${reply.source}」`
}

export function ReplyListPage() {
  const [passcode, setPasscode] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<ViewState>('locked')
  const [data, setData] = useState<ReplyData | null>(null)
  const [sheet, setSheet] = useState<SheetState>(null)
  const [editForm, setEditForm] = useState({
    count: '',
    name: '',
    source: '婚礼' as ReplySource,
  })
  const [mutating, setMutating] = useState(false)
  const [actionError, setActionError] = useState('')
  const pressTimerRef = useRef<number | null>(null)
  const pressStartRef = useRef({ x: 0, y: 0 })

  const fetchReplies = async (code: string) => {
    const response = await fetch('/api/reply-list', {
      body: JSON.stringify({ passcode: code }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as ReplyData & { message?: string }
    if (!response.ok) {
      throw new Error(result.message ?? '暂时无法读取回执。')
    }
    return result
  }

  const unlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState('loading')
    setMessage('')

    try {
      const result = await fetchReplies(passcode)
      setData(result)
      setState('ready')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : '验证失败。')
    }
  }

  const exportReplies = () => {
    if (!data) return
    const pad = (value: number) => String(value).padStart(2, '0')
    const now = new Date()
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`
    const blob = new Blob([`${JSON.stringify(data.replies, null, 2)}\n`], {
      type: 'application/json;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `回执簿-${stamp}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
  }

  const clearPressTimer = () => {
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
  }

  const openActions = (index: number) => {
    setActionError('')
    setSheet({ mode: 'actions', index })
  }

  const startLongPress = (index: number, event: React.PointerEvent<HTMLTableRowElement>) => {
    if (event.pointerType === 'mouse') return
    pressStartRef.current = { x: event.clientX, y: event.clientY }
    clearPressTimer()
    pressTimerRef.current = window.setTimeout(() => {
      pressTimerRef.current = null
      openActions(index)
    }, LONG_PRESS_MS)
  }

  const moveLongPress = (event: React.PointerEvent<HTMLTableRowElement>) => {
    if (!pressTimerRef.current) return
    const dx = Math.abs(event.clientX - pressStartRef.current.x)
    const dy = Math.abs(event.clientY - pressStartRef.current.y)
    if (dx > 10 || dy > 10) clearPressTimer()
  }

  const openEdit = (index: number) => {
    const reply = data?.replies[index]
    if (!reply) return
    setEditForm({
      count: String(reply.count),
      name: reply.name,
      source: reply.source,
    })
    setActionError('')
    setSheet({ mode: 'edit', index })
  }

  const saveEdit = async () => {
    if (!sheet || sheet.mode !== 'edit') return
    const count = Number(editForm.count)
    if (!editForm.name.trim()) {
      setActionError('姓名不能为空。')
      return
    }
    if (!editForm.count.trim() || !Number.isInteger(count) || count < 1) {
      setActionError('人数请填写大于等于 1 的整数。')
      return
    }

    setMutating(true)
    setActionError('')
    try {
      const response = await fetch('/api/rsvps', {
        body: JSON.stringify({
          index: sheet.index,
          name: editForm.name.trim(),
          count,
          source: editForm.source,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
      })
      const result = (await response.json()) as { message?: string }
      if (!response.ok) {
        throw new Error(result.message ?? '保存失败，请稍后再试。')
      }
      setData(await fetchReplies(passcode))
      setSheet(null)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '保存失败，请稍后再试。')
    } finally {
      setMutating(false)
    }
  }

  const confirmDelete = async () => {
    if (!sheet || sheet.mode !== 'delete') return
    setMutating(true)
    setActionError('')
    try {
      const response = await fetch('/api/rsvps', {
        body: JSON.stringify({ index: sheet.index }),
        headers: { 'Content-Type': 'application/json' },
        method: 'DELETE',
      })
      const result = (await response.json()) as { message?: string }
      if (!response.ok) {
        throw new Error(result.message ?? '删除失败，请稍后再试。')
      }
      setData(await fetchReplies(passcode))
      setSheet(null)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '删除失败，请稍后再试。')
    } finally {
      setMutating(false)
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
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
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
          <div className="reply-list-ledger__actions">
            <span>{data.replies.length} 份回执</span>
            <button className="reply-list-export" type="button" onClick={exportReplies}>
              <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
                <path d="M8 1.75v8.5m0 0 3.25-3.25M8 10.25 4.75 7M2.25 13.75h11.5" />
              </svg>
              导出 JSON
            </button>
          </div>
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
                  <tr
                    key={`${reply.source}-${reply.name}-${index}`}
                    onContextMenu={(event) => {
                      event.preventDefault()
                      openActions(index)
                    }}
                    onPointerCancel={clearPressTimer}
                    onPointerDown={(event) => startLongPress(index, event)}
                    onPointerMove={moveLongPress}
                    onPointerUp={clearPressTimer}
                  >
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
          {data.replies.length > 0 && (
            <p className="reply-list-hint">长按（或右键）某一行，可编辑或删除该回执。</p>
          )}
        </div>
      </section>

      {sheet && (
        <div className="reply-list-sheet" role="dialog" aria-modal="true">
          <button
            aria-label="关闭操作面板"
            className="reply-list-sheet__backdrop"
            type="button"
            onClick={() => setSheet(null)}
          />
          <div className="reply-list-sheet__panel" onClick={(event) => event.stopPropagation()}>
            {sheet.mode === 'actions' && (
              <>
                <p className="reply-list-sheet__eyebrow">EDIT ENTRY</p>
                <p className="reply-list-sheet__title">
                  {describeReply(data.replies[sheet.index])}
                </p>
                <div className="reply-list-sheet__actions">
                  <button
                    className="reply-list-sheet__button reply-list-sheet__button--primary"
                    type="button"
                    onClick={() => openEdit(sheet.index)}
                  >
                    编辑这条回执
                  </button>
                  <button
                    className="reply-list-sheet__button reply-list-sheet__button--danger"
                    type="button"
                    onClick={() => {
                      setActionError('')
                      setSheet({ mode: 'delete', index: sheet.index })
                    }}
                  >
                    删除这条回执
                  </button>
                </div>
              </>
            )}

            {sheet.mode === 'edit' && (
              <>
                <p className="reply-list-sheet__eyebrow">EDIT ENTRY</p>
                <p className="reply-list-sheet__title">
                  编辑第 {String(sheet.index + 1).padStart(2, '0')} 条回执
                </p>
                <div className="reply-list-sheet__form">
                  <label className="reply-list-sheet__field">
                    <span>姓名</span>
                    <input
                      disabled={mutating}
                      maxLength={40}
                      value={editForm.name}
                      onChange={(event) =>
                        setEditForm((form) => ({ ...form, name: event.target.value }))
                      }
                    />
                  </label>
                  <label className="reply-list-sheet__field">
                    <span>人数</span>
                    <input
                      disabled={mutating}
                      inputMode="numeric"
                      min="1"
                      type="number"
                      value={editForm.count}
                      onChange={(event) =>
                        setEditForm((form) => ({ ...form, count: event.target.value }))
                      }
                    />
                  </label>
                  <div className="reply-list-sheet__field">
                    <span>来源</span>
                    <div className="reply-list-sheet__sources">
                      {(['婚礼', '出阁'] as const).map((option) => (
                        <button
                          aria-pressed={editForm.source === option}
                          className={`reply-list-sheet__source ${
                            editForm.source === option ? 'is-active' : ''
                          }`}
                          disabled={mutating}
                          key={option}
                          type="button"
                          onClick={() => setEditForm((form) => ({ ...form, source: option }))}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {actionError && (
                  <p aria-live="polite" className="reply-list-sheet__error" role="alert">
                    {actionError}
                  </p>
                )}
                <div className="reply-list-sheet__actions">
                  <button
                    className="reply-list-sheet__button reply-list-sheet__button--primary"
                    disabled={mutating}
                    type="button"
                    onClick={() => void saveEdit()}
                  >
                    {mutating ? '保存中…' : '保存修改'}
                  </button>
                  <button
                    className="reply-list-sheet__button"
                    disabled={mutating}
                    type="button"
                    onClick={() => setSheet(null)}
                  >
                    取消
                  </button>
                </div>
              </>
            )}

            {sheet.mode === 'delete' && (
              <>
                <p className="reply-list-sheet__eyebrow">DELETE ENTRY</p>
                <p className="reply-list-sheet__title">
                  确认删除{describeReply(data.replies[sheet.index])}？
                </p>
                {actionError && (
                  <p aria-live="polite" className="reply-list-sheet__error" role="alert">
                    {actionError}
                  </p>
                )}
                <div className="reply-list-sheet__actions">
                  <button
                    className="reply-list-sheet__button reply-list-sheet__button--danger"
                    disabled={mutating}
                    type="button"
                    onClick={() => void confirmDelete()}
                  >
                    {mutating ? '删除中…' : '确认删除'}
                  </button>
                  <button
                    className="reply-list-sheet__button"
                    disabled={mutating}
                    type="button"
                    onClick={() => setSheet(null)}
                  >
                    取消
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
