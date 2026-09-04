import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { revealLines } from '../lib/motion'

export function useSceneReveal(ref: RefObject<HTMLElement | null>, active: boolean) {
  useLayoutEffect(() => {
    if (!active || !ref.current) return
    const ctx = gsap.context(() => revealLines(ref.current!), ref)
    return () => ctx.revert()
  }, [active, ref])
}
