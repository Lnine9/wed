/**
 * 图层设计 —— 统一管理 z 轴层级与语义
 *
 * 通过集中定义避免各处硬编码 z-index，新增图层只需在此追加。
 * 数值越大越靠前。
 */
import type { LayerId } from './types'

export interface LayerDef {
  id: LayerId
  /** 中文说明 */
  label: string
  zIndex: number
}

export const LAYERS = {
  /** 天空背景（颜色、渐变） */
  SKY: { id: 'sky', label: '天空背景', zIndex: 0 },
  /** 星光（夜空点缀） */
  STARS: { id: 'stars', label: '星光', zIndex: 10 },
  /** 天体（太阳 / 月亮） */
  CELESTIAL: { id: 'celestial', label: '天体', zIndex: 20 },
  /** 云朵 */
  CLOUD: { id: 'cloud', label: '云朵', zIndex: 30 },
  /** 地面 */
  GROUND: { id: 'ground', label: '地面', zIndex: 40 },
  /** 角色（猪） */
  ACTOR: { id: 'actor', label: '角色', zIndex: 50 },
  /** 前景 UI（提示、指示器） */
  OVERLAY: { id: 'overlay', label: '前景 UI', zIndex: 100 },
} satisfies Record<string, LayerDef>

export type LayerKey = keyof typeof LAYERS

/** 按 id 查询 z-index */
export function zIndexOf(layerId: LayerId): number {
  const found = Object.values(LAYERS).find((l) => l.id === layerId)
  return found?.zIndex ?? 0
}
