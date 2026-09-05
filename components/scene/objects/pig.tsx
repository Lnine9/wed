import { raised } from '../neu'

/**
 * 猪 —— emoji 角色，置于轻拟物圆台上，保证与全局风格统一
 */
export function Pig({ facing = 'right' }: { facing?: 'left' | 'right' }) {
  const pad = 104
  return (
    <div
      aria-hidden
      style={{
        width: pad,
        height: pad,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #eef2f6, #d9e0e8)',
        ...raised(pad / 2, 1),
      }}
    >
      <span
        style={{
          fontSize: 54,
          lineHeight: 1,
          transform: `scaleX(${facing === 'left' ? -1 : 1})`,
          filter: 'drop-shadow(2px 4px 4px rgba(80,90,110,0.28))',
        }}
      >
        {'\uD83D\uDC16'}
      </span>
    </div>
  )
}
