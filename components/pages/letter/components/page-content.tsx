'use client'

import { FormEvent, FocusEvent, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

const EASE_OUT = [0.16, 1, 0.3, 1] as const

const POEM_LINES = [
  '灵魂叠放。不可分离，亦不可吞没',
  '这是危险的术法，也是他们唯一愿学的',
  '星夜的前路没有赐福，仅有彼此',
] as const

const CALL_LINE = '请来，见证这次远行！'

type SubmissionState = 'idle' | 'sending' | 'success' | 'error'

export function LetterPageContent({
  active,
  source,
}: {
  active: boolean
  source: '婚礼' | '出阁'
}) {
  const reduceMotion = useReducedMotion()
  const [name, setName] = useState('')
  const [count, setCount] = useState('1')
  const [status, setStatus] = useState<SubmissionState>('idle')
  const [message, setMessage] = useState('')
  const stageRef = useRef<HTMLElement>(null)

  // 键盘弹起时 visualViewport 收缩，同步给容器，让内容高度真正自适应
  useEffect(() => {
    const stage = stageRef.current
    const viewport = window.visualViewport
    if (!stage || !viewport) return

    const syncHeight = () => {
      stage.style.setProperty('--letter-vh', `${viewport.height}px`)
    }
    syncHeight()
    viewport.addEventListener('resize', syncHeight)
    return () => viewport.removeEventListener('resize', syncHeight)
  }, [])

  // 聚焦时等键盘弹起后，把输入框滚进可视区
  const focusInput = (event: FocusEvent<HTMLInputElement>) => {
    const target = event.target
    window.setTimeout(() => {
      target.scrollIntoView({
        block: 'center',
        behavior: reduceMotion ? 'auto' : 'smooth',
      })
    }, 260)
  }

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
      setMessage('回执已收到，星夜再会。')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : '发送失败，请稍后再试。')
    }
  }

  const isReadOnly = status === 'sending' || status === 'success'
  const enter = (delay: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    animate: active ? { opacity: 1, y: 0 } : { opacity: 0, y: reduceMotion ? 0 : 16 },
    transition: {
      delay: reduceMotion ? 0 : delay,
      duration: reduceMotion ? 0.01 : 1.05,
      ease: EASE_OUT,
    },
  })

  return (
    <section aria-label="邀请回执" className="letter-page" ref={stageRef}>
      <div aria-hidden="true" className="letter-page__stars" />

      <article className="letter-page__inner">
        <motion.p className="letter-page__eyebrow" {...enter(0.1)}>
          {source === '出阁' ? '出阁之约' : '婚礼之约'} · AN INVITATION
        </motion.p>

        <div className="letter-page__poem">
          {POEM_LINES.map((line, index) => (
            <motion.p
              className="letter-page__line"
              key={line}
              {...enter(0.32 + index * 0.26)}
            >
              {line}
            </motion.p>
          ))}
          <motion.p
            className="letter-page__line letter-page__line--call"
            {...enter(0.32 + POEM_LINES.length * 0.26)}
          >
            {CALL_LINE}
          </motion.p>
        </div>

        <motion.div aria-hidden="true" className="letter-page__rule" {...enter(1.3)} />

        <motion.dl className="letter-page__meta" {...enter(1.42)}>
          <div>
            <dt>时间</dt>
            <dd>敬请期待</dd>
          </div>
          <div>
            <dt>地点</dt>
            <dd>敬请期待</dd>
          </div>
        </motion.dl>

        <motion.form
          className="letter-page__rsvp"
          data-deck-control
          onSubmit={submit}
          {...enter(1.56)}
        >
          <p className="letter-page__rsvp-label">RSVP · 赴约回执</p>
          <div className="letter-page__fields">
            <label className="letter-page__field">
              <span>姓名</span>
              <input
                autoComplete="name"
                disabled={isReadOnly}
                maxLength={40}
                name="name"
                placeholder="请留下姓名"
                required
                value={name}
                onFocus={focusInput}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="letter-page__field">
              <span>人数</span>
              <input
                disabled={isReadOnly}
                inputMode="numeric"
                min="1"
                name="count"
                required
                type="number"
                value={count}
                onFocus={focusInput}
                onChange={(event) => setCount(event.target.value)}
              />
            </label>
          </div>
          <button className="letter-page__submit" disabled={isReadOnly} type="submit">
            <span>
              {status === 'sending'
                ? '回执寄出中'
                : status === 'success'
                  ? '已收到回执'
                  : '寄出回执'}
            </span>
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 12">
              <path d="M0 6h22m0 0L17 1m5 5l-5 5" />
            </svg>
          </button>
          {message && (
            <p
              aria-live="polite"
              className={`letter-page__message is-${status}`}
              role={status === 'error' ? 'alert' : undefined}
            >
              {message}
            </p>
          )}
        </motion.form>
      </article>
    </section>
  )
}