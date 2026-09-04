import { useCallback, useEffect, useRef, useState } from 'react'
import { SceneContainer } from '../../components/SceneContainer'
import { SceneProgress } from '../../components/SceneProgress'
import { ContinueButton } from '../../components/ContinueButton'
import { SakuraNameReveal } from '../../components/SakuraNameReveal'
import { STORY_CONFIG } from '../../config/story'
import { reducedMotion } from '../../lib/motion'
import type { SceneProps } from '../types'

export function SceneButterfly(props: SceneProps) {
  const { active, playSound } = props
  const ref = useRef<HTMLElement>(null)
  const [formed, setFormed] = useState(false)
  const [departing, setDeparting] = useState(false)
  const hasPlayedSound = useRef(false)

  useEffect(() => {
    if (!active || hasPlayedSound.current) return
    hasPlayedSound.current = true
    playSound('bloom')
  }, [active, playSound])

  const settle = useCallback(() => {
    setFormed(true)
    playSound('reveal')
  }, [playSound])

  const depart = () => {
    if (departing) return
    setDeparting(true)
    props.playSound('cosmic')
    setTimeout(props.onComplete, reducedMotion() ? 10 : 1200)
  }
  return (
    <SceneContainer
      ref={ref}
      {...props}
      className={`scene-butterfly ${departing ? 'is-departing' : ''}`}
    >
      <SceneProgress index={5} total={8} />
      <div className="sakura-atmosphere" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="sakura-name-stage">
        <SakuraNameReveal active={active} departing={departing} onSettled={settle} />
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {formed ? `${STORY_CONFIG.girlName}.` : 'Cherry blossom petals are gathering.'}
      </p>
      {formed && <ContinueButton label="Follow the butterfly" onClick={depart} />}
    </SceneContainer>
  )
}
