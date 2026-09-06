import { useEffect, useRef, useState } from 'react'
import { SceneContainer } from '../../components/SceneContainer'
import { SceneProgress } from '../../components/SceneProgress'
import { InteractiveHint } from '../../components/InteractiveHint'
import { StarField } from '../../components/StarField'
import { GalaxyMorph, MORPH_SECONDS } from '../../components/GalaxyMorph'
import { STORY_CONFIG } from '../../config/story'
import { useSceneReveal } from '../../hooks/useSceneReveal'
import { reducedMotion } from '../../lib/motion'
import type { SceneProps } from '../types'

export function SceneCosmos(props: SceneProps) {
  const ref = useRef<HTMLElement>(null)
  const [morphed, setMorphed] = useState(false)
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useSceneReveal(ref, props.active)
  useEffect(
    () => () => {
      if (settleTimer.current) clearTimeout(settleTimer.current)
    },
    [],
  )
  const morph = () => {
    if (morphed) return
    setMorphed(true)
    props.playSound('cosmic')
    // Touching the six is the last thing the story asks for. Once the L has settled it runs
    // on into the ending by itself, so the six and everything after it is one continuous take.
    settleTimer.current = setTimeout(
      props.onComplete,
      reducedMotion() ? 10 : (MORPH_SECONDS + 0.9) * 1000,
    )
  }
  return (
    <SceneContainer
      ref={ref}
      {...props}
      tone="cosmic"
      className={`scene-cosmos ${morphed ? 'is-morphed' : ''}`}
    >
      <SceneProgress index={3} total={5} />
      <StarField dense />
      <blockquote className="quote-stars" data-reveal>
        “{STORY_CONFIG.quotes.stars}”
      </blockquote>
      <blockquote className="quote-universe">“{STORY_CONFIG.quotes.universe}”</blockquote>
      <button
        className="galaxy-button"
        onClick={morph}
        aria-label="Make the galaxy converge"
        data-cursor="action"
      >
        <GalaxyMorph morphed={morphed} />
        <span className="galaxy-label">{morphed ? 'L' : '6'}</span>
      </button>
      {!morphed ? <InteractiveHint>Touch the galaxy shaped like a six</InteractiveHint> : null}
    </SceneContainer>
  )
}
