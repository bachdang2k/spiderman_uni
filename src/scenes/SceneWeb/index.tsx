import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { SceneContainer } from '../../components/SceneContainer'
import { WebCanvas } from '../../components/WebCanvas'
import { ComicHalftone } from '../../components/ComicHalftone'
import { SceneProgress } from '../../components/SceneProgress'
import { InteractiveHint } from '../../components/InteractiveHint'
import { RevealText } from '../../components/RevealText'
import { STORY_CONFIG } from '../../config/story'
import { useSceneReveal } from '../../hooks/useSceneReveal'
import type { SceneProps } from '../types'

export function SceneWeb(props: SceneProps) {
  const ref = useRef<HTMLElement>(null),
    [shot, setShot] = useState<{ x: number; y: number } | null>(null),
    [done, setDone] = useState(false),
    [pokes, setPokes] = useState(0),
    [secret, setSecret] = useState(false)
  useSceneReveal(ref, props.active)
  const fire = (e: React.MouseEvent) => {
    if (done) return
    const next = pokes + 1
    setPokes(next)
    if (next === 3) {
      setSecret(true)
      setTimeout(() => setSecret(false), 2600)
    }
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setShot({ x: e.clientX || box.left + box.width / 2, y: e.clientY || box.top + box.height / 2 })
    setDone(true)
    props.playSound('thwip')
    gsap.to(ref.current, {
      scale: 1.035,
      duration: 0.7,
      ease: 'power3.inOut',
      yoyo: true,
      repeat: 1,
    })
    setTimeout(props.onComplete, 1150)
  }
  return (
    <SceneContainer
      ref={ref}
      id={props.id}
      index={props.index}
      active={props.active}
      className={`scene-web ${done ? 'web-fired' : ''}`}
    >
      <SceneProgress index={0} total={8} />
      <ComicHalftone opacity={0.13} />
      <WebCanvas burst={done} target={shot} />
      <div className="web-motion-lines" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="thwip-mark" aria-hidden="true">
        THWIP
      </div>
      <div className="scene-copy scene-copy--top">
        <RevealText lines={STORY_CONFIG.scenes.web} />
      </div>
      <button
        className="web-target"
        onClick={fire}
        aria-label="Touch the thread"
        data-cursor="action"
      >
        <span />
        <span />
        <span />
      </button>
      <InteractiveHint hidden={done}>Touch the thread</InteractiveHint>
      {secret && (
        <div className="comic-note">
          <b>Hey.</b> Stop touching random things.<small>…actually, keep going.</small>
        </div>
      )}
    </SceneContainer>
  )
}
