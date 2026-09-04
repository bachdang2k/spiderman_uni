import { forwardRef, type ReactNode } from 'react'

type Props = {
  id: string
  index: number
  active: boolean
  children: ReactNode
  tone?: 'night' | 'paper' | 'cosmic'
  className?: string
}

export const SceneContainer = forwardRef<HTMLElement, Props>(function SceneContainer(
  { id, index, active, children, tone = 'night', className = '' },
  ref,
) {
  return (
    <section
      ref={ref}
      id={`scene-${id}`}
      data-scene={index}
      data-active={active}
      className={`scene scene--${tone} ${active ? 'is-active' : ''} ${className}`}
    >
      {children}
    </section>
  )
})
