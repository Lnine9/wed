'use client'

import { type MotionValue, motion, useMotionTemplate } from 'motion/react'
import type { ReactNode } from 'react'
import { zIndexOf } from '@/lib/scene/layers'
import type { EntityConfig } from '@/lib/scene/types'
import { useEntityTransform } from '@/lib/scene/use-entity-transform'

/**
 * AnimatedObject —— 通用动画对象容器
 *
 * 把「实体配置 + 全局进度 MotionValue」解析成一组 Motion 值并驱动定位/变换，
 * 内部渲染什么完全由 children 决定，实现视觉与动画的解耦。
 * 变换通过 transformTemplate 组装，保证 -50% 居中锚点。
 */
export function AnimatedObject({
  config,
  progress,
  children,
}: {
  config: EntityConfig
  progress: MotionValue<number>
  children: ReactNode
}) {
  const { x, y, rotate, scale, opacity } = useEntityTransform(progress, config)

  // x/y 为舞台百分比 -> 拼成 left/top 字符串
  const left = useMotionTemplate`${x}%`
  const top = useMotionTemplate`${y}%`

  return (
    <motion.div
      data-entity={config.id}
      style={{
        position: 'absolute',
        left,
        top,
        rotate,
        scale,
        opacity,
        zIndex: zIndexOf(config.layer),
        display: 'grid',
        placeItems: 'center',
        willChange: 'transform, opacity',
      }}
      transformTemplate={({ rotate: r, scale: s }) =>
        `translate(-50%, -50%) rotate(${r}) scale(${s})`
      }
    >
      {children}
    </motion.div>
  )
}
