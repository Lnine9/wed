/**
 * 云朵 —— 由多个柔和凸起圆团叠合而成的轻拟物云
 */
export function Cloud({ size = 120 }: { size?: number }) {
  const unit = size / 120
  const puff = (w: number, h: number, x: number, y: number) => ({
    position: 'absolute' as const,
    width: w * unit,
    height: h * unit,
    left: x * unit,
    top: y * unit,
    borderRadius: '50%',
    background: 'linear-gradient(145deg, #ffffff, #dfe6ed)',
    boxShadow:
      '-4px -4px 10px rgba(255,255,255,0.85), 5px 6px 14px rgba(120,140,160,0.22)',
  })
  return (
    <div
      aria-hidden
      style={{ width: size, height: size * 0.6, position: 'relative' }}
    >
      <div style={puff(64, 64, 0, 20)} />
      <div style={puff(52, 52, 44, 26)} />
      <div style={puff(72, 72, 24, 4)} />
      <div style={puff(46, 46, 74, 24)} />
    </div>
  )
}
