import { gsap } from 'gsap'

export const EASE = {
  cinematic: 'power3.inOut',
  soft: 'power2.out',
  snap: 'expo.out',
  organic: 'sine.inOut',
}

export const revealLines = (root: Element) => {
  const lines = root.querySelectorAll('[data-reveal]')
  const reduce = reducedMotion()
  return gsap.fromTo(
    lines,
    { y: reduce ? 0 : 28, opacity: 0, filter: reduce ? 'blur(0px)' : 'blur(8px)' },
    {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: reduce ? 0.01 : 1.1,
      stagger: reduce ? 0 : 0.42,
      ease: EASE.soft,
    },
  )
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
