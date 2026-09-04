import { useEffect, useRef } from 'react'
import { STORY_CONFIG } from '../config/story'
import { reducedMotion } from '../lib/motion'

type Star = { x: number; y: number; tx: number; ty: number; size: number; alpha: number }

export function StarInvitation() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    let frame = 0
    const started = performance.now()
    const setup = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(devicePixelRatio, 1.6)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      const sample = document.createElement('canvas')
      sample.width = rect.width
      sample.height = rect.height
      const sampleContext = sample.getContext('2d')!
      const size = Math.min(rect.width * 0.11, 68)
      sampleContext.fillStyle = '#fff'
      sampleContext.textAlign = 'center'
      sampleContext.textBaseline = 'middle'
      sampleContext.font = `400 ${size}px "Cormorant Garamond"`
      const lines = STORY_CONFIG.final.invitationLines
      lines.forEach((line, index) =>
        sampleContext.fillText(line, rect.width / 2, rect.height / 2 + (index - 0.5) * size * 1.15),
      )
      const data = sampleContext.getImageData(0, 0, rect.width, rect.height).data
      const stars: Star[] = []
      const step = rect.width < 600 ? 6 : 7
      for (let y = 0; y < rect.height; y += step) {
        for (let x = 0; x < rect.width; x += step) {
          if (data[(y * rect.width + x) * 4 + 3] > 120) {
            stars.push({
              x: Math.random() * rect.width,
              y: Math.random() * rect.height,
              tx: x,
              ty: y,
              size: Math.random() * 1.5 + 0.6,
              alpha: Math.random() * 0.5 + 0.5,
            })
          }
        }
      }
      return { rect, stars }
    }
    let field = setup()
    const draw = (now: number) => {
      const duration = reducedMotion() ? 1 : 2200
      const raw = Math.min(1, (now - started) / duration)
      const progress = 1 - Math.pow(1 - raw, 4)
      context.clearRect(0, 0, field.rect.width, field.rect.height)
      for (const star of field.stars) {
        const x = star.x + (star.tx - star.x) * progress
        const y = star.y + (star.ty - star.y) * progress
        context.beginPath()
        context.fillStyle = `rgba(247,241,227,${star.alpha})`
        context.arc(x, y, star.size, 0, Math.PI * 2)
        context.fill()
      }
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    const resize = () => (field = setup())
    addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('resize', resize)
    }
  }, [])
  return (
    <div className="star-invitation">
      <canvas ref={ref} aria-hidden="true" />
      <h1>{STORY_CONFIG.final.invitation}</h1>
    </div>
  )
}
