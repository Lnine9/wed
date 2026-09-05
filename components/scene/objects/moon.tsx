/**
 * 月亮 —— 轻拟物冷灰凸起圆盘，带凹陷环形山
 */
export function Moon() {
  const size = 92
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background:
          'radial-gradient(circle at 35% 30%, #e7ecf2, #c3ccd8 62%, #aab4c2)',
        boxShadow:
          '-6px -6px 14px rgba(255,255,255,0.18), 8px 8px 20px rgba(0,0,0,0.5), 0 0 44px rgba(190,204,224,0.4)',
      }}
    >
      {[
        { top: 22, left: 26, d: 16 },
        { top: 50, left: 52, d: 22 },
        { top: 30, left: 58, d: 11 },
      ].map((c, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: c.top,
            left: c.left,
            width: c.d,
            height: c.d,
            borderRadius: '50%',
            boxShadow:
              'inset -2px -2px 4px rgba(255,255,255,0.35), inset 3px 3px 6px rgba(120,132,150,0.55)',
          }}
        />
      ))}
    </div>
  )
}
