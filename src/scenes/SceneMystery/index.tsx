import { useRef, useState } from 'react'
import { SceneContainer } from '../../components/SceneContainer'
import { SceneProgress } from '../../components/SceneProgress'
import { ContinueButton } from '../../components/ContinueButton'
import { InteractiveHint } from '../../components/InteractiveHint'
import { StarField } from '../../components/StarField'
import { WebCanvas } from '../../components/WebCanvas'
import { MysterySeed } from '../../components/MysterySeed'
import { STORY_CONFIG } from '../../config/story'
import { useSceneReveal } from '../../hooks/useSceneReveal'
import type { SceneProps } from '../types'

export function SceneMystery(props: SceneProps) {
  const ref = useRef<HTMLElement>(null)
  const [opened, setOpened] = useState(false)
  useSceneReveal(ref, props.active)
  const open = () => {
    if (opened) return
    setOpened(true)
    props.playSound('reveal')
  }
  return (
    <SceneContainer ref={ref} {...props} className={`scene-mystery ${opened ? 'seed-opened' : ''}`}>
      <SceneProgress index={6} total={8} />
      <StarField />
      <WebCanvas burst={opened} />
      <div className="mystery-copy">
        {STORY_CONFIG.scenes.mystery.map((line) => (
          <p data-reveal key={line}>
            {line}
          </p>
        ))}
      </div>
      <button
        className="mystery-button"
        onClick={open}
        aria-label="Mở kén sao"
        data-cursor="action"
      >
        <MysterySeed opened={opened} />
      </button>
      {!opened ? (
        <InteractiveHint>Chạm vào vật thể lạ</InteractiveHint>
      ) : (
        <ContinueButton label="Xem các vì sao đang viết gì" onClick={props.onComplete} />
      )}
    </SceneContainer>
  )
}
