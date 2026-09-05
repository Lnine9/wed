'use client'

/**
 * useEntityTransform —— 实体求值（关键帧 -> Motion 值）
 *
 * 取代此前手写的 SceneEntity + interpolate + easing：
 * 把「全局进度 MotionValue」通过 Motion 的 useTransform 映射成
 * 每个属性（x/y/rotate/scale/opacity）的 MotionValue，
 * 插值、分段缓动全部交给 Motion，且不触发 React 重渲染。
 */
import {
  easingDefinitionToFunction,
  type EasingFunction,
  type MotionValue,
  useTransform,
} from 'motion/react'
import {
  DEFAULT_TRANSFORM,
  type EntityConfig,
  type TransformKey,
  TRANSFORM_KEYS,
} from './types'

export interface EntityMotion {
  x: MotionValue<number>
  y: MotionValue<number>
  rotate: MotionValue<number>
  scale: MotionValue<number>
  opacity: MotionValue<number>
}

/** 解析配置为「已排序章节索引」与「取值函数」 */
function useEntityChannels(config: EntityConfig) {
  const stops = Object.keys(config.keyframes)
    .map(Number)
    .sort((a, b) => a - b)

  const base = { ...DEFAULT_TRANSFORM, ...config.base }

  /** 某章节某属性的目标值，缺省回落 base */
  const valueAt = (stop: number, key: TransformKey) => {
    const v = config.keyframes[stop]?.[key]
    return v === undefined ? base[key] : v
  }

  /** 每段（stop[i] -> stop[i+1]）的缓动取自「目标关键帧」，解析为 Motion 可用的函数 */
  const segmentEases: EasingFunction[] = stops
    .slice(1)
    .map((stop) =>
      easingDefinitionToFunction(config.keyframes[stop]?.easing ?? 'easeInOut'),
    )

  return { stops, valueAt, segmentEases }
}

/**
 * 单个属性通道：progress -> 该属性的 MotionValue。
 * ease 数组长度需为 输出点数 - 1（每段一个）。
 */
function useChannel(
  progress: MotionValue<number>,
  stops: number[],
  outputs: number[],
  ease: EasingFunction[],
) {
  // 单段时无需 ease 数组（避免长度不匹配告警）
  return useTransform(progress, stops, outputs, ease.length ? { ease } : undefined)
}

export function useEntityTransform(
  progress: MotionValue<number>,
  config: EntityConfig,
): EntityMotion {
  const { stops, valueAt, segmentEases } = useEntityChannels(config)
  const out = (key: TransformKey) => stops.map((s) => valueAt(s, key))

  // 固定顺序调用，满足 Hooks 规则
  const [xKey, yKey, rKey, sKey, oKey] = TRANSFORM_KEYS
  const x = useChannel(progress, stops, out(xKey), segmentEases)
  const y = useChannel(progress, stops, out(yKey), segmentEases)
  const rotate = useChannel(progress, stops, out(rKey), segmentEases)
  const scale = useChannel(progress, stops, out(sKey), segmentEases)
  const opacity = useChannel(progress, stops, out(oKey), segmentEases)

  return { x, y, rotate, scale, opacity }
}
