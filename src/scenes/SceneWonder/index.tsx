import { useRef, useState } from 'react'
import { SceneContainer } from '../../components/SceneContainer'
import { SceneProgress } from '../../components/SceneProgress'
import { ContinueButton } from '../../components/ContinueButton'
import { InteractiveHint } from '../../components/InteractiveHint'
import { ComicHalftone } from '../../components/ComicHalftone'
import { WonderHeroine } from '../../components/WonderHeroine'
import { STORY_CONFIG } from '../../config/story'
import { useSceneReveal } from '../../hooks/useSceneReveal'
import type { SceneProps } from '../types'

export function SceneWonder(props: SceneProps) {
  const ref = useRef<HTMLElement>(null)
  const [awakened, setAwakened] = useState(false)
  useSceneReveal(ref, props.active)
  const open = () => {
    if (awakened) return
    setAwakened(true)
    props.playSound('cosmic')
  }
  return (
    <SceneContainer
      ref={ref}
      {...props}
      className={`scene-wonder ${awakened ? 'portal-open' : ''}`}
    >
      <SceneProgress index={2} total={8} />
      <ComicHalftone opacity={0.11} />
      <p className="wonder-label" data-reveal>
        WONDER // WOMAN
      </p>
      <div className="wonder-copy">
        {STORY_CONFIG.scenes.wonder.map((line) => (
          <p data-reveal key={line}>
            {line}
          </p>
        ))}
      </div>
      <div className="wonder-portal" aria-hidden="true" />
      <button
        className="heroine-button"
        onClick={open}
        aria-label="Chạm vào huy hiệu của cô ấy"
        data-cursor="action"
      >
        <WonderHeroine awakened={awakened} />
      </button>
      {!awakened ? (
        <InteractiveHint>Chạm vào huy hiệu</InteractiveHint>
      ) : (
        <ContinueButton label="Bước vào cổng sao" onClick={props.onComplete} />
      )}
    </SceneContainer>
  )
}
