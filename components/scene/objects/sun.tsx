/**
 * 太阳 —— 轻拟物暖色凸起圆盘
 */
export function Sun() {
  const size = 96
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background:
          'radial-gradient(circle at 35% 30%, #f0e2c2, #dcc79a 60%, #cbb488)',
        boxShadow:
          '-7px -7px 16px rgba(255,255,255,0.7), 8px 8px 20px rgba(120,100,60,0.28), 0 0 46px rgba(220,199,154,0.55)',
      }}
    >
      {/* 内圈柔和高光，强化拟物层次 */}
      <div
        style={{
          position: 'absolute',
          inset: 14,
          borderRadius: '50%',
          boxShadow:
            'inset -4px -4px 8px rgba(150,125,80,0.25), inset 5px 5px 10px rgba(255,255,255,0.55)',
        }}
      />
    </div>
  )
}
