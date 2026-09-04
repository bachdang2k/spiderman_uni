import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null),
    ring = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (matchMedia('(pointer: coarse)').matches) return
    let x = 0,
      y = 0,
      rx = 0,
      ry = 0,
      raf = 0
    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      dot.current?.style.setProperty('transform', `translate3d(${x}px,${y}px,0)`)
    }
    const loop = () => {
      rx += (x - rx) * 0.16
      ry += (y - ry) * 0.16
      ring.current?.style.setProperty('transform', `translate3d(${rx}px,${ry}px,0)`)
      raf = requestAnimationFrame(loop)
    }
    const over = (e: PointerEvent) =>
      ring.current?.classList.toggle(
        'cursor--active',
        !!(e.target as HTMLElement).closest('button,[data-cursor]'),
      )
    addEventListener('pointermove', move)
    addEventListener('pointerover', over)
    loop()
    return () => {
      removeEventListener('pointermove', move)
      removeEventListener('pointerover', over)
      cancelAnimationFrame(raf)
    }
  }, [])
  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  )
}
