'use client'

/**
 * useChapterSwipe —— 章节滑动逻辑封装
 *
 * 基于成熟库实现，不再手写指针捕获与 tween：
 *  - @use-gesture/react 处理拖拽 / 滚轮手势（含 tap 过滤、touch-action）
 *  - motion 的 MotionValue 承载连续进度、animate() 负责松手吸附
 *
 * 对外暴露 progress(MotionValue)、当前章节 index、绑定容器的 bind()、goTo()。
 * 与视觉完全解耦，可用于任意「多章节滑动切换」场景。
 */
import { useGesture } from '@use-gesture/react'
import { animate, type MotionValue, useMotionValue } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

export type SwipeAxis = 'vertical' | 'horizontal'

interface Options {
  chapters: number
  axis?: SwipeAxis
  /** 吸附动画时长（秒） */
  snapDuration?: number
  /** 触发翻页的最小归一化位移（0~1） */
  threshold?: number
  /** 触发翻页的手势速度阈值 */
  velocityThreshold?: number
}

interface SwipeApi {
  progress: MotionValue<number>
  index: number
  /** 展开到滑动容器上的事件绑定 */
  bind: ReturnType<typeof useGesture>
  /** 编程式跳转到指定章节 */
  goTo: (index: number) => void
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

export function useChapterSwipe({
  chapters,
  axis = 'vertical',
  snapDuration = 0.5,
  threshold = 0.18,
  velocityThreshold = 0.35,
}: Options): SwipeApi {
  const max = Math.max(0, chapters - 1)
  const progress = useMotionValue(0)
  const [index, setIndex] = useState(0)
  const wheelLock = useRef(false)

  // progress 变化 -> 同步当前章节（用于指示器高亮）
  useEffect(() => {
    const unsub = progress.on('change', (v) => {
      setIndex(Math.round(clamp(v, 0, max)))
    })
    return () => unsub()
  }, [progress, max])

  const snapTo = useCallback(
    (target: number) => {
      const to = clamp(Math.round(target), 0, max)
      animate(progress, to, {
        duration: snapDuration,
        ease: 'easeOut',
      })
    },
    [progress, max, snapDuration],
  )

  const goTo = useCallback((i: number) => snapTo(i), [snapTo])

  const bind = useGesture(
    {
      // 拖拽：实时把位移换算成连续进度，松手按阈值/速度吸附
      onDrag: ({
        first,
        last,
        movement: [mx, my],
        velocity: [vx, vy],
        direction: [dx, dy],
        tap,
        memo,
        event,
      }) => {
        if (tap) return memo
        const el = event.currentTarget as HTMLElement | null
        const size =
          (axis === 'vertical' ? el?.clientHeight : el?.clientWidth) || 1
        const start: number = first ? progress.get() : (memo ?? 0)
        const move = axis === 'vertical' ? my : mx
        // 向上/向左拖动 -> 进度增大（前往下一章）
        const next = clamp(start - move / size, 0, max)

        if (last) {
          const vel = axis === 'vertical' ? vy : vx
          const dir = axis === 'vertical' ? dy : dx
          const baseIdx = Math.floor(start)
          const frac = next - baseIdx
          // 速度足够快：顺手势方向翻一页
          if (vel > velocityThreshold) {
            snapTo(dir < 0 ? baseIdx + 1 : baseIdx)
          } else if (frac >= threshold && frac < 0.5) {
            snapTo(baseIdx + 1)
          } else if (frac <= 1 - threshold && frac > 0.5) {
            snapTo(baseIdx)
          } else {
            snapTo(next)
          }
          return start
        }

        progress.set(next)
        return start
      },
      // 滚轮 / 触控板：锁一段时间只翻一页
      onWheel: ({ direction: [dx, dy], event }) => {
        event.preventDefault()
        if (wheelLock.current) return
        const dir = axis === 'vertical' ? dy : dx
        if (dir === 0) return
        wheelLock.current = true
        snapTo(Math.round(progress.get()) + (dir > 0 ? 1 : -1))
        window.setTimeout(
          () => {
            wheelLock.current = false
          },
          snapDuration * 1000 + 60,
        )
      },
    },
    {
      drag: {
        filterTaps: true,
        // 不捕获指针，保证子元素（指示点）的原生 click 仍可触发
        pointer: { capture: false },
        axis: axis === 'vertical' ? 'y' : 'x',
      },
      wheel: { eventOptions: { passive: false } },
    },
  )

  return { progress, index, bind, goTo }
}
