'use client'

import { type MotionValue, motion, useTransform } from 'motion/react'
import { useMemo } from 'react'

/**
 * 星光层 —— 夜空点缀
 *
 * 整体透明度由进度 MotionValue 驱动（越接近夜晚越亮，不触发重渲染）。
 * 位置使用确定性伪随机，避免 SSR/CSR 水合不一致。
 */
export function Stars({ progress }: { progress: MotionValue<number> }) {
  const stars = useMemo(() => {
    // 线性同余伪随机，固定种子 -> 稳定布局
    let seed = 20240901
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    return Array.from({ length: 46 }, () => ({
      x: rand() * 100,
      y: rand() * 48, // 仅分布在上半天空
      s: 1 + rand() * 2.4,
      delay: rand() * 3,
      dur: 2.4 + rand() * 2.6,
    }))
  }, [])

  // 后 65% 进度内星光淡入
  const opacity = useTransform(progress, [0.35, 0.9], [0, 1], { clamp: true })

  return (
    <motion.div
      aria-hidden
      style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}
    >
      {stars.map((st, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.s,
            height: st.s,
            borderRadius: '50%',
            background: '#eef2f8',
            boxShadow: '0 0 6px rgba(238,242,248,0.9)',
            animation: `sceneTwinkle ${st.dur}s ease-in-out ${st.delay}s infinite`,
          }}
        />
      ))}
    </motion.div>
  )
}
