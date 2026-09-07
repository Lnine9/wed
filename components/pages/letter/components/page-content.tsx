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
  const [count, setCount] = useState('')
  const [status, setStatus] = useState<SubmissionState>('idle')
  const [message, setMessage] = useState('')
  const stageRef = useRef<HTMLElement>(null)

  const [keyboardMode, setKeyboardMode] = useState(false)

  // 键盘弹起时 visualViewport 收缩，同步给容器；仅在键盘模式下允许内层滚动
  // （平时若为滚动容器，iOS 会因触摸滚动触发 pointercancel，劫持翻页手势）
  useEffect(() => {
    const stage = stageRef.current
    const viewport = window.visualViewport
    if (!stage || !viewport) return

    const syncHeight = () => {
      stage.style.setProperty('--letter-vh', `${viewport.height}px`)
      setKeyboardMode(viewport.height < window.innerHeight - 120)
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
    if (count.trim() === '') {
      setStatus('error')
      setMessage('请填写人数。')
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
      setMessage('')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : '发送失败，请稍后再试。')
    }
  }

  const isReadOnly = status === 'sending' || status === 'success'
  const eventInfo =
    source === '出阁'
      ? {
          date: '2026/09/26 12:00:00',
          venue: '重庆市潼南区梓潼街道龙马主题宴会酒店',
          city: '重庆',
        }
      : {
          date: '2026/10/05 12:00:00',
          venue: '山东省济宁市八方斋（车站西路店）',
          city: '济宁',
        }
  const [toast, setToast] = useState<{ text: string; pending?: boolean } | null>(null)
  const toastTimerRef = useRef<number | null>(null)

  const showToast = (
    text: string,
    options?: { pending?: boolean; duration?: number },
  ) => {
    setToast({ text, pending: options?.pending })
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(
      () => setToast(null),
      options?.duration ?? 2800,
    )
  }

  const copyVenue = async () => {
    const venue = eventInfo.venue
    const notify = () => showToast('地址已复制，请打开地图粘贴搜索')
    try {
      await navigator.clipboard.writeText(venue)
      notify()
      return
    } catch {
      // 忽略，走 execCommand 兜底
    }
    const helper = document.createElement('textarea')
    helper.value = venue
    helper.style.position = 'fixed'
    helper.style.opacity = '0'
    document.body.appendChild(helper)
    helper.select()
    let copied = false
    try {
      copied = document.execCommand('copy')
    } catch {
      copied = false
    }
    helper.remove()
    showToast(copied ? '地址已复制，请打开地图粘贴搜索' : '复制失败，请手动记录地址')
  }

  // 挨个尝试：高德App → 百度App → 高德H5 → 复制地址
  const openNavigation = () => {
    showToast('正在打开地图…', { pending: true, duration: 4600 })
    const keyword = encodeURIComponent(eventInfo.venue)
    const city = encodeURIComponent(eventInfo.city)
    const amapH5 = `https://uri.amap.com/search?keyword=${keyword}&city=${city}&view=map&callnative=1&src=wed`
    const amapScheme = `androidamap://keywordSearch?keyword=${keyword}&city=${city}&sourceApplication=wed`
    const baiduScheme = `baidumap://map/place/search?query=${keyword}&region=${city}&src=wed`

    const ua = navigator.userAgent
    const isAndroid = /android/i.test(ua)
    const isIOS = /iphone|ipad|ipod/i.test(ua)

    if (!isAndroid && !isIOS) {
      // 桌面：直接开高德网页版
      const win = window.open(amapH5, '_blank', 'noopener')
      if (!win) void copyVenue()
      return
    }

    if (isIOS) {
      // iOS：uri.amap.com 官方中转，装了高德会自动唤起 App，没装则打开 H5
      window.location.href = amapH5
      return
    }

    // Android：scheme 未注册时静默失败，用延时逐个尝试
    window.location.href = amapScheme
    window.setTimeout(() => {
      if (document.visibilityState !== 'visible') return
      window.location.href = baiduScheme
      window.setTimeout(() => {
        if (document.visibilityState !== 'visible') return
        window.location.href = amapH5
        window.setTimeout(() => {
          if (document.visibilityState !== 'visible') return
          void copyVenue()
        }, 1800)
      }, 1200)
    }, 1200)
  }

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
      <img
        alt=""
        aria-hidden="true"
        className="letter-page__backdrop"
        draggable={false}
        loading="eager"
        src="/assets/星夜.jpg"
      />
      <div aria-hidden="true" className="letter-page__shade" />

      <article
        className={`letter-page__inner${keyboardMode ? ' is-scrollable' : ''}`}
      >
        <div className="letter-page__top">
          <motion.p className="letter-page__eyebrow" {...enter(0.1)}>
            {source === '出阁' ? '出阁之宴' : '婚礼之约'} · AN INVITATION
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
              <dd>{eventInfo.date}</dd>
            </div>
            <div>
              <dt>地点</dt>
              <dd className="letter-page__venue" onClick={openNavigation}>
                {eventInfo.venue}
                <button
                  aria-label="打开地图导航"
                  className="letter-page__nav"
                  data-deck-control
                  type="button"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M3.5 10.5 20.5 3.5l-7 17-2.4-7.6-7.6-2.4z" />
                  </svg>
                </button>
              </dd>
            </div>
          </motion.dl>
        </div>

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
                placeholder="赴宴人数"
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

      {toast && (
        <div
          className={`letter-page__toast${toast.pending ? ' is-pending' : ''}`}
          role="status"
        >
          {toast.text}
        </div>
      )}
    </section>
  )
}
