import { useRef, useState } from 'react'
import { SceneContainer } from '../../components/SceneContainer'
import { SceneProgress } from '../../components/SceneProgress'
import { ContinueButton } from '../../components/ContinueButton'
import { InteractiveHint } from '../../components/InteractiveHint'
import { SakuraRain } from '../../components/SakuraRain'
import { STORY_CONFIG } from '../../config/story'
import { useSceneReveal } from '../../hooks/useSceneReveal'
import type { SceneProps } from '../types'

export function SceneRain(props: SceneProps) {
  const ref = useRef<HTMLElement>(null)
  const [awakened, setAwakened] = useState(false)
  useSceneReveal(ref, props.active)
  const rain = () => {
    if (awakened) return
    setAwakened(true)
    props.playSound('bloom')
  }
  return (
    <SceneContainer ref={ref} {...props} className={`scene-rain ${awakened ? 'is-awakened' : ''}`}>
      <SceneProgress index={4} total={8} />
      <div className="rain-color-bloom" aria-hidden="true" />
      <div className="rain-copy">
        {STORY_CONFIG.scenes.rain.map((line) => (
          <p data-reveal key={line}>
            {line}
          </p>
        ))}
      </div>
      <button
        className="rain-button"
        onClick={rain}
        aria-label="Chạm vào giọt mưa"
        data-cursor="action"
      >
        <SakuraRain awakened={awakened} />
      </button>
      {!awakened ? (
        <InteractiveHint>Chạm vào giọt mưa</InteractiveHint>
      ) : (
        <ContinueButton label="Đi theo những cánh hoa" onClick={props.onComplete} />
      )}
    </SceneContainer>
  )
}
