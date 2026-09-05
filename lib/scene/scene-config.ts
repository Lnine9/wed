/**
 * 场景配置 —— 声明式描述「白天/黑夜」两章 demo
 *
 * 数据与视觉解耦：这里只描述「物体在各章节的状态」，
 * 具体长什么样由 kind 映射到 components/scene 中的视觉组件。
 * 新增一个物体只需在此追加一条配置 + 注册一个视觉组件。
 *
 * 缓动直接用 Motion 内置名（不再自研 easing）：
 *   easeIn / easeOut / easeInOut / backOut / circOut ...
 */
import { LAYERS } from './layers'
import type { EntityConfig } from './types'

/** 章节数量：0=白天，1=黑夜 */
export const CHAPTERS = 2

export const CHAPTER_LABELS = ['白天', '黑夜'] as const

/** 视觉种类，用于把配置映射到渲染组件 */
export type EntityKind = 'sun' | 'moon' | 'cloud' | 'pig'

/** demo 用的实体配置（在基础 EntityConfig 上加了 kind 与视觉参数） */
export interface DemoEntityConfig extends EntityConfig {
  kind: EntityKind
  /** 传给视觉组件的静态参数（尺寸、朝向等） */
  props?: Record<string, unknown>
}

/**
 * 天空 / 地面 配色（由 Motion 在 RGB 空间随进度插值）。
 * 克制的中性冷灰蓝，贴合轻拟物基调。
 */
export const PALETTE = {
  skyTop: { day: '#d9e3ec', night: '#10141d' },
  skyBottom: { day: '#eef3f7', night: '#1a2130' },
  ground: { day: '#e3e9ef', night: '#151b26' },
  groundEdge: { day: '#d2dae2', night: '#0e131c' },
} as const

export const ENTITIES: DemoEntityConfig[] = [
  // 太阳：静止居于天空偏上，切到夜晚时「旋转 + 缩小 + 淡出」消失
  {
    id: 'sun',
    kind: 'sun',
    layer: LAYERS.CELESTIAL.id,
    base: { x: 50, y: 26, opacity: 1, scale: 1, rotate: 0 },
    keyframes: {
      0: { x: 50, y: 26, opacity: 1, scale: 1, rotate: 0 },
      1: { x: 50, y: 20, opacity: 0, scale: 0.25, rotate: 200, easing: 'easeIn' },
    },
  },
  // 月亮：夜晚时从下方「旋转 + 升起 + 淡入」
  {
    id: 'moon',
    kind: 'moon',
    layer: LAYERS.CELESTIAL.id,
    base: { x: 50, y: 26, opacity: 0, scale: 0.4, rotate: -180 },
    keyframes: {
      0: { x: 50, y: 60, opacity: 0, scale: 0.4, rotate: -180 },
      1: { x: 50, y: 26, opacity: 1, scale: 1, rotate: 0, easing: 'backOut' },
    },
  },
  // 云朵（两片）：白天可见，切夜晚时上飘淡出
  {
    id: 'cloud-a',
    kind: 'cloud',
    layer: LAYERS.CLOUD.id,
    props: { size: 120 },
    base: { x: 26, y: 18, opacity: 1 },
    keyframes: {
      0: { x: 26, y: 18, opacity: 0.95 },
      1: { x: 20, y: 12, opacity: 0, easing: 'easeOut' },
    },
  },
  {
    id: 'cloud-b',
    kind: 'cloud',
    layer: LAYERS.CLOUD.id,
    props: { size: 88 },
    base: { x: 72, y: 32, opacity: 1 },
    keyframes: {
      0: { x: 72, y: 32, opacity: 0.85 },
      1: { x: 80, y: 26, opacity: 0, easing: 'easeOut' },
    },
  },
  // 左猪：切夜晚时向左移出屏幕
  {
    id: 'pig-left',
    kind: 'pig',
    layer: LAYERS.ACTOR.id,
    props: { facing: 'right' },
    base: { x: 30, y: 74 },
    keyframes: {
      0: { x: 30, y: 74, rotate: 0 },
      1: { x: -20, y: 74, rotate: -12, easing: 'easeInOut' },
    },
  },
  // 右猪：切夜晚时向右移出屏幕
  {
    id: 'pig-right',
    kind: 'pig',
    layer: LAYERS.ACTOR.id,
    props: { facing: 'left' },
    base: { x: 70, y: 74 },
    keyframes: {
      0: { x: 70, y: 74, rotate: 0 },
      1: { x: 122, y: 74, rotate: 12, easing: 'easeInOut' },
    },
  },
]
