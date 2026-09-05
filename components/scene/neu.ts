import type { CSSProperties } from 'react'

/**
 * 轻拟物（Neumorphism）样式工具
 *
 * 统一“凸起 / 凹陷 / 柔和高光”的表达，保证全场景风格一致。
 * 通过传入基础色，自动生成成对的高光与暗影。
 */

/** 凸起：上左高光 + 下右暗影 */
export function raised(
  radius = 24,
  intensity = 1,
): CSSProperties {
  const light = 0.75 * intensity
  const dark = 0.16 * intensity
  const blur = 14 * intensity
  const dist = 6 * intensity
  return {
    borderRadius: radius,
    boxShadow: `-${dist}px -${dist}px ${blur}px rgba(255,255,255,${light}), ${dist}px ${dist}px ${blur + 2}px rgba(15,23,42,${dark})`,
  }
}

/** 凹陷：内嵌高光与暗影 */
export function pressed(radius = 24, intensity = 1): CSSProperties {
  const light = 0.7 * intensity
  const dark = 0.18 * intensity
  const dist = 5 * intensity
  const blur = 10 * intensity
  return {
    borderRadius: radius,
    boxShadow: `inset -${dist}px -${dist}px ${blur}px rgba(255,255,255,${light}), inset ${dist}px ${dist}px ${blur}px rgba(15,23,42,${dark})`,
  }
}

/** 暗色场景下的凸起（夜晚天体用），高光更收敛 */
export function raisedDark(radius = 24, glow?: string): CSSProperties {
  return {
    borderRadius: radius,
    boxShadow: `-6px -6px 14px rgba(255,255,255,0.06), 8px 8px 18px rgba(0,0,0,0.55)${glow ? `, 0 0 40px ${glow}` : ''}`,
  }
}
