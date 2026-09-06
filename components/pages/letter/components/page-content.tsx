'use client'

import { FormEvent, useState } from 'react'

type SubmissionState = 'idle' | 'sending' | 'success' | 'error'

export function LetterPageContent({ source }: { source: '婚礼' | '出阁' }) {
  const [name, setName] = useState('')
  const [count, setCount] = useState('1')
  const [status, setStatus] = useState<SubmissionState>('idle')
  const [message, setMessage] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()
    const guestCount = Number(count)
    if (!trimmedName) {
      setStatus('error')
      setMessage('请留下您的姓名。')
      return
    }
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      setStatus('error')
      setMessage('人数请填写大于等于 1 的整数。')
      return
    }

    setStatus('sending')
    setMessage('')
    try {
      const response = await fetch('/api/rsvps', {
        body: JSON.stringify({ source, name: trimmedName, count: guestCount }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = (await response.json()) as { message?: string }
      if (!response.ok) {
        throw new Error(result.message ?? '发送失败，请稍后再试。')
      }
      setStatus('success')
      setMessage('回执已收到，婚礼当天见。')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : '发送失败，请稍后再试。')
    }
  }

  return (
    <section aria-label="婚礼邀请信" className="letter-page">
      <div className="letter-page__grain" />
      <article className="letter-page__paper">
        <header className="letter-page__header">
          <p>❤️ 囍 · We&apos;re married · 囍 ❤️</p>
          <h1>我们结婚啦</h1>
          <span aria-hidden="true" />
        </header>

        <div className="letter-page__body">
          <p>喜乐共赏，岁月悠长</p>
          <p>缘起朝夕，相伴四时</p>
          <p>
            诚邀您携家人，莅临现场，见证我们的重要时刻✨
            <br />
            静候相逢
          </p>
        </div>

        <dl className="letter-page__event">
          <div>
            <dt>🤵 新郎</dt>
            <dd>王先生</dd>
          </div>
          <div>
            <dt>👰 新娘</dt>
            <dd>李小姐</dd>
          </div>
          <div>
            <dt>📆 时间</dt>
            <dd>2023年5月20日 午宴（星期六）</dd>
          </div>
          <div>
            <dt>📍 地点</dt>
            <dd>XXX酒店‑X楼X厅</dd>
          </div>
        </dl>

        <section className="letter-page__notes" aria-labelledby="letter-tips">
          <h2 id="letter-tips">💡 温馨提示</h2>
          <ol>
            <li>推荐浅色系穿搭，合影会更加出片。</li>
            <li>若您赴约，带上好心情和好胃口，我们婚礼相见。</li>
            <li>倘若路途遥远、诸事繁忙无法亲临，遥寄一份祝福，亦感念于心。山海自有归期，期待他日相逢。</li>
            <li>当日宾客繁多，难免招待不周，望诸位多多包涵。</li>
          </ol>
        </section>

        <form className="letter-page__rsvp" data-deck-control onSubmit={submit}>
          <div className="letter-page__rsvp-heading">
            <p>RSVP</p>
            <h2>赴约回执</h2>
          </div>
          <div className="letter-page__rsvp-fields">
            <label>
              <span>姓名</span>
              <input
                autoComplete="name"
                disabled={status === 'sending' || status === 'success'}
                maxLength={40}
                name="name"
                placeholder="请填写您的姓名"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label>
              <span>人数</span>
              <input
                disabled={status === 'sending' || status === 'success'}
                inputMode="numeric"
                min="1"
                name="count"
                required
                type="number"
                value={count}
                onChange={(event) => setCount(event.target.value)}
              />
            </label>
          </div>
          <button disabled={status === 'sending' || status === 'success'} type="submit">
            {status === 'sending' ? '发送中…' : status === 'success' ? '已发送' : '发送回执'}
          </button>
          {message && (
            <p
              aria-live="polite"
              className={`letter-page__form-message is-${status}`}
              role={status === 'error' ? 'alert' : undefined}
            >
              {message}
            </p>
          )}
        </form>
      </article>
    </section>
  )
}
