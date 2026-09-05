'use client'

import {
  type MotionValue,
  motion,
  useMotionTemplate,
  useTransform,
} from 'motion/react'
import { PALETTE } from '@/lib/scene/scene-config'

/**
 * 地面 —— 占据下半屏，颜色随进度昼夜过渡，顶部一道轻拟物高光边。
 * 颜色/阴影强度由 Motion 值驱动，避免父级重渲染。
 */
export function Ground({ progress }: { progress: MotionValue<number> }) {
  const face = useTransform(
    progress,
    [0, 1],
    [PALETTE.ground.day, PALETTE.ground.night],
  )
  const edge = useTransform(
    progress,
    [0, 1],
    [PALETTE.groundEdge.day, PALETTE.groundEdge.night],
  )
  const background = useMotionTemplate`linear-gradient(180deg, ${face}, ${edge})`

  // 高光随昼夜减弱、暗影随昼夜增强
  const topLight = useTransform(progress, [0, 1], [0.5, 0.08])
  const bottomDark = useTransform(progress, [0, 1], [0.08, 0.3])
  const boxShadow = useMotionTemplate`inset 0 6px 14px rgba(255,255,255,${topLight}), inset 0 -8px 20px rgba(0,0,0,${bottomDark})`

  return (
    <motion.div
      aria-hidden
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '38%',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        background,
        boxShadow,
      }}
    />
  )
}
