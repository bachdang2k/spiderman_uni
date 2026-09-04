import { useEffect, useRef } from 'react'

export function WebCanvas({
  burst = false,
  target,
}: {
  burst?: boolean
  target?: { x: number; y: number } | null
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current,
      ctx = c?.getContext('2d')
    if (!c || !ctx) return
    let w = 0,
      h = 0,
      raf = 0,
      t = 0,
      dpr = 1
    const resize = () => {
      dpr = Math.min(devicePixelRatio, 2)
      w = c.clientWidth
      h = c.clientHeight
      c.width = w * dpr
      c.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const draw = () => {
      t += 0.01
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2,
        cy = h / 2
      ctx.strokeStyle = 'rgba(247,241,227,.38)'
      ctx.lineWidth = 0.7
      const rings = burst ? 8 : 5,
        radius = Math.min(w, h) * (burst ? 0.42 : 0.19)
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius)
        ctx.stroke()
      }
      for (let r = 1; r <= rings; r++) {
        ctx.beginPath()
        for (let i = 0; i <= 12; i++) {
          const a = (i * Math.PI) / 6,
            warp = Math.sin(t * 2 + i + r) * 3,
            rr = radius * (r / rings) + warp
          const x = cx + Math.cos(a) * rr,
            y = cy + Math.sin(a) * rr
          if (i) ctx.lineTo(x, y)
          else ctx.moveTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()
      }
      if (target) {
        ctx.strokeStyle = 'rgba(230,57,70,.92)'
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.quadraticCurveTo((cx + target.x) / 2, cy - 80, target.x, target.y)
        ctx.stroke()
      }
      raf = requestAnimationFrame(draw)
    }
    resize()
    addEventListener('resize', resize)
    draw()
    return () => {
      removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [burst, target])
  return <canvas ref={ref} className="web-canvas" aria-hidden="true" />
}
