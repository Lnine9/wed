'use client'

import { useEffect, useState } from 'react'

const PRELOAD_IMAGES = [
  '/assets/主背景2.jpg',
  '/assets/橄榄.png',
  '/assets/主背景.jpg',
  '/assets/百合.png',
  '/assets/同桌背景.jpg',
  '/assets/同桌桌子.jpg',
  '/assets/猪1.png',
  '/assets/猪2.png',
  '/assets/左.png',
  '/assets/右.png',
  '/assets/film-frame.png',
  '/assets/合照.jpg',
  '/assets/毕业合照1.jpg',
  '/assets/毕业合照2.jpg',
  '/assets/背景2.png',
  '/assets/山1.png',
  '/assets/山.png',
  '/assets/山上爱心.jpg',
  '/assets/山顶合照.jpg',
  '/assets/干杯.jpg',
  '/assets/洗象池合照.jpg',
  '/assets/373071788235267_.pic_web.webp',
  '/assets/373081788235278_.pic_web.webp',
  '/assets/373091788235284_.pic_web.webp',
  '/assets/373171788235332_.pic_web.webp',
  '/assets/373191788235347_.pic_web.webp',
  '/assets/视频首帧.jpg',
  '/assets/星夜.jpg',
] as const

export function InitialLoading() {
  const [isLeaving, setIsLeaving] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isMounted, setIsMounted] = useState(true)

  useEffect(() => {
    const preloadedImages = PRELOAD_IMAGES.map((src) => {
      const image = new Image()
      image.decoding = 'async'
      image.src = src
      return image
    })
    const readyTimer = window.setTimeout(() => setIsReady(true), 4000)

    return () => {
      preloadedImages.forEach((image) => {
        image.onload = null
        image.onerror = null
      })
      window.clearTimeout(readyTimer)
    }
  }, [])

  const enterProject = () => {
    if (!isReady) return
    window.dispatchEvent(new Event('initial-loading-enter'))
    setIsLeaving(true)
    window.setTimeout(() => setIsMounted(false), 550)
  }

  if (!isMounted) return null

  return (
    <div
      aria-label={isReady ? '点击进入邀请函' : '页面加载中'}
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
        <p className="initial-loading__message">
          {isReady ? '点击进入' : '正在铺展这一刻'}
        </p>
        {isReady ? (
          <button
            aria-label="点击进入邀请函并播放音乐"
            className="initial-loading__enter"
            onClick={enterProject}
            onPointerDown={(event) => event.stopPropagation()}
            type="button"
          >
            开启这一刻
          </button>
        ) : (
          <div aria-hidden="true" className="initial-loading__progress">
            <span />
          </div>
        )}
      </div>
    </div>
  )
}
