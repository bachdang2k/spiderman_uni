import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SceneContainer } from '../../components/SceneContainer'
import { SceneProgress } from '../../components/SceneProgress'
import { ContinueButton } from '../../components/ContinueButton'
import { InteractiveHint } from '../../components/InteractiveHint'
import { STORY_CONFIG } from '../../config/story'
import { useSceneReveal } from '../../hooks/useSceneReveal'
import type { SceneProps } from '../types'

const shapes = ['diamond', 'ring', 'slash', 'diamond', 'ring', 'odd', 'slash', 'ring']
export function SceneSpiderSense(props: SceneProps) {
  const ref = useRef<HTMLElement>(null),
    [tries, setTries] = useState(0),
    [solved, setSolved] = useState(false)
  useSceneReveal(ref, props.active)
  const pick = (i: number) => {
    if (solved) return
    props.playSound('click')
    if (i === 5) setSolved(true)
    else setTries((v) => v + 1)
  }
  return (
    <SceneContainer
      ref={ref}
      id={props.id}
      index={props.index}
      active={props.active}
      className="scene-sense"
    >
      <SceneProgress index={1} total={5} />
      <div className="sense-header">
        <p className="eyebrow" data-reveal>
          QUICK TEST
        </p>
        <h2 data-reveal>{STORY_CONFIG.scenes.sense.title}</h2>
        <p data-reveal>{STORY_CONFIG.scenes.sense.subtitle}</p>
      </div>
      <div className="sense-field">
        {shapes.map((shape, i) => (
          <button
            key={i}
            aria-label={`Object ${i + 1}`}
            className={`sense-object sense-object--${shape}`}
            onClick={() => pick(i)}
            style={{ '--i': i } as React.CSSProperties}
            data-cursor="action"
          >
            <i />
            <i />
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={solved ? 'yes' : tries}
          className="sense-feedback"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {solved ? (
            <>
              <b>{STORY_CONFIG.scenes.sense.right[0]}</b>
              <span>{STORY_CONFIG.scenes.sense.right[1]}</span>
            </>
          ) : tries > 0 ? (
            <>
              <b>{STORY_CONFIG.scenes.sense.wrong[0]}</b>
              <span>{STORY_CONFIG.scenes.sense.wrong[1]}</span>
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>
      {!solved ? (
        <InteractiveHint>Find the one that feels different</InteractiveHint>
      ) : (
        <ContinueButton onClick={props.onComplete} />
      )}
    </SceneContainer>
  )
}
