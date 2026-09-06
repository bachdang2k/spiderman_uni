import { useCallback, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SCENE_ORDER } from './config/story'
import { SoundToggle } from './components/SoundToggle'
import { CustomCursor } from './components/CustomCursor'
import { CinematicTransition } from './components/CinematicTransition'
import { useSound } from './hooks/useSound'
import { reducedMotion } from './lib/motion'
import { SceneWeb } from './scenes/SceneWeb'
import { SceneSpiderSense } from './scenes/SceneSpiderSense'
import { SceneWonder } from './scenes/SceneWonder'
import { SceneCosmos } from './scenes/SceneCosmos'
import { SceneHeart } from './scenes/SceneHeart'
import type { SceneProps } from './scenes/types'

gsap.registerPlugin(ScrollTrigger)
const scenes = [SceneWeb, SceneSpiderSense, SceneWonder, SceneCosmos, SceneHeart]
const LAST_SCENE = scenes.length - 1
export default function App() {
  return <StoryExperience />
}

function StoryExperience() {
  const [current, setCurrent] = useState(0),
    [unlocked, setUnlocked] = useState(1),
    [transition, setTransition] = useState(false)
  const lenisRef = useRef<Lenis | null>(null),
    sound = useSound()
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      smoothWheel: true,
      wheelMultiplier: 0.75,
      touchMultiplier: 1.1,
    })
    lenisRef.current = lenis
    let raf = 0
    const loop = (t: number) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    lenis.on('scroll', ScrollTrigger.update)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Home') lenisRef.current?.scrollTo(0)
      if (e.key === 'End' && unlocked > LAST_SCENE) lenisRef.current?.scrollTo('#scene-heart')
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [unlocked])
  useEffect(() => {
    if (current === 0 || unlocked <= current) return
    const reduce = reducedMotion()
    const frame = requestAnimationFrame(() => {
      lenisRef.current?.resize()
      lenisRef.current?.scrollTo(`#scene-${SCENE_ORDER[current]}`, {
        duration: reduce ? 0.01 : 1.35,
        immediate: reduce,
        lock: true,
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [current, unlocked])
  const advance = useCallback(
    (from: number) => {
      if (from !== current || from >= LAST_SCENE) return
      const reduce = reducedMotion()
      // The last handover carries the galaxy's L straight into the ending. A wipe there would
      // cut the one thing that beat depends on, so it is the only transition without one.
      const seamless = from === LAST_SCENE - 1
      setTransition(!reduce && !seamless)
      setTimeout(
        () => {
          const next = from + 1
          setUnlocked((v) => Math.max(v, next + 1))
          setCurrent(next)
          if (!seamless) setTimeout(() => setTransition(false), reduce ? 10 : 850)
        },
        reduce || seamless ? 10 : 420,
      )
    },
    [current],
  )
  return (
    <main className={current === LAST_SCENE ? 'is-ending' : ''}>
      <a href="#scene-web" className="skip-link">
        Back to the beginning
      </a>
      {current < LAST_SCENE ? <SoundToggle enabled={sound.enabled} toggle={sound.toggle} /> : null}
      <CustomCursor />
      <CinematicTransition visible={transition} />
      {scenes.slice(0, unlocked).map((Scene, index) => {
        const sceneProps: SceneProps = {
          id: SCENE_ORDER[index],
          index,
          active: index === current,
          onComplete: () => advance(index),
          playSound: sound.play,
        }
        return <Scene key={SCENE_ORDER[index]} {...sceneProps} />
      })}
    </main>
  )
}
