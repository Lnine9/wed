'use client'

import { useEffect, useState } from 'react'

export function InitialLoading() {
  const [isLeaving, setIsLeaving] = useState(false)
  const [isMounted, setIsMounted] = useState(true)

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setIsLeaving(true), 4000)
    const removeTimer = window.setTimeout(() => setIsMounted(false), 4550)

    return () => {
      window.clearTimeout(leaveTimer)
      window.clearTimeout(removeTimer)
    }
  }, [])

  if (!isMounted) return null

  return (
    <div
      aria-label="页面加载中"
      aria-live="polite"
      className={`initial-loading${isLeaving ? ' is-leaving' : ''}`}
      role="status"
    >
      <div aria-hidden="true" className="initial-loading__veil" />
      <div className="initial-loading__content">
        <svg
          aria-hidden="true"
          className="initial-loading__mark"
          fill="none"
          viewBox="0 0 72 72"
        >
          <circle className="initial-loading__ring" cx="36" cy="36" r="25" />
          <path className="initial-loading__orbit" d="M36 11a25 25 0 0 1 22 13" />
          <circle className="initial-loading__dot" cx="36" cy="11" r="2.2" />
        </svg>
        <p className="initial-loading__eyebrow">A MOMENT TOGETHER</p>
        <p className="initial-loading__message">正在铺展这一刻</p>
        <div aria-hidden="true" className="initial-loading__progress">
          <span />
        </div>
      </div>
    </div>
  )
}
