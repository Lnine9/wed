/**
 * 场景动画引擎 —— 核心类型定义
 *
 * 设计理念：整个动画由一个连续的「进度值 progress」驱动。
 * progress ∈ [0, chapters-1]，例如两章时 0 表示第一页、1 表示第二页，
 * 中间的小数表示滑动过程中的中间态。
 *
 * 关键帧的「求值 / 插值 / 缓动 / 颜色过渡」全部下沉给 Motion（motion/react）
 * 的 MotionValue + useTransform，本文件只保留声明式的数据结构。
 */
import type { Easing } from 'motion/react'

/** 变换属性：所有可被动画驱动的数值，均相对「舞台」尺寸 */
export interface Transform {
  /** 中心点 X，单位为舞台宽度百分比（0~100，可越界以移出屏幕） */
  x: number
  /** 中心点 Y，单位为舞台高度百分比 */
  y: number
  /** 旋转角度，单位 deg */
  rotate: number
  /** 缩放比例，1 为原始尺寸 */
  scale: number
  /** 不透明度，0~1 */
  opacity: number
}

/** 可被动画驱动的属性键 */
export type TransformKey = keyof Transform

/**
 * 缓动：直接复用 Motion 的 Easing 类型。
 * 可为内置名（'easeInOut' | 'backOut' ...）、cubicBezier() 数组，或自定义函数。
 */
export type { Easing }

/** 关键帧：某一章节下物体的目标状态（可只声明部分属性） */
export type Keyframe = Partial<Transform> & {
  /** 从「上一关键帧」过渡到「本关键帧」时使用的缓动，默认 easeInOut */
  easing?: Easing
}

/** 章节索引 -> 关键帧 的映射 */
export type Keyframes = Record<number, Keyframe>

/** 图层标识，用于统一管理 z 轴层级 */
export type LayerId = string

/** 实体配置：声明式描述一个可动画对象 */
export interface EntityConfig {
  id: string
  /** 所属图层 */
  layer: LayerId
  /** 静止基准变换（未被关键帧覆盖的属性回落到此处） */
  base?: Partial<Transform>
  /** 各章节关键帧 */
  keyframes: Keyframes
}

/** 默认变换：任何属性缺省时的回落值 */
export const DEFAULT_TRANSFORM: Transform = {
  x: 50,
  y: 50,
  rotate: 0,
  scale: 1,
  opacity: 1,
}

/** 所有可动画属性键（固定顺序，供 hooks 稳定遍历） */
export const TRANSFORM_KEYS: readonly TransformKey[] = [
  'x',
  'y',
  'rotate',
  'scale',
  'opacity',
]
