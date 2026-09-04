import { useEffect, useRef } from 'react'

type Props = { count?: number; color?: string; speed?: number; connect?: boolean }
export function ParticleBackground({
  count = 44,
  color = '#f7f1e3',
  speed = 0.12,
  connect = false,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = matchMedia('(pointer: coarse)').matches
    let w = 0,
      h = 0,
      dpr = 1,
      raf = 0
    const pts = Array.from({ length: Math.min(count, coarse ? 28 : count) }, (_, i) => ({
      x: ((i * 83) % 101) / 101,
      y: ((i * 47) % 97) / 97,
      r: 0.6 + (i % 4) * 0.35,
      vx: Math.sin(i) * speed,
      vy: Math.cos(i * 2) * speed,
    }))
    const resize = () => {
      dpr = Math.min(devicePixelRatio, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = color
      pts.forEach((p) => {
        if (!reduce) {
          p.x += p.vx / w
          p.y += p.vy / h
          if (p.x < 0 || p.x > 1) p.vx *= -1
          if (p.y < 0 || p.y > 1) p.vy *= -1
        }
        ctx.globalAlpha = 0.2 + p.r * 0.12
        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2)
        ctx.fill()
      })
      if (connect) {
        ctx.strokeStyle = color
        ctx.lineWidth = 0.35
        pts.forEach((a, i) =>
          pts.slice(i + 1).forEach((b) => {
            const dx = (a.x - b.x) * w,
              dy = (a.y - b.y) * h,
              d = Math.hypot(dx, dy)
            if (d < 100) {
              ctx.globalAlpha = (1 - d / 100) * 0.14
              ctx.beginPath()
              ctx.moveTo(a.x * w, a.y * h)
              ctx.lineTo(b.x * w, b.y * h)
              ctx.stroke()
            }
          }),
        )
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    resize()
    addEventListener('resize', resize)
    draw()
    return () => {
      removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [count, color, speed, connect])
  return <canvas ref={ref} className="particle-canvas" aria-hidden="true" />
}
