import { useMemo, useRef } from 'react'
import { SceneContainer } from '../../components/SceneContainer'
import { HeartWriting } from '../../components/HeartWriting'
import { composeScript } from '../../assets/lettering/lines'
import { STORY_CONFIG } from '../../config/story'
import { useSceneReveal } from '../../hooks/useSceneReveal'
import type { SceneProps } from '../types'

/**
 * Natural phrase breaks for the invitation, widest first. The renderer takes the first one
 * that still fits at the question's size, so a narrow viewport gets three lines and a wide one
 * gets two — and no line is ever broken mid-phrase to make it fit a box.
 */
function questionSplits(sentence: string) {
  const words = sentence.split(' ')
  const at = (...counts: number[]) => {
    const lines: string[] = []
    let cursor = 0
    for (const size of counts) {
      lines.push(words.slice(cursor, cursor + size).join(' '))
      cursor += size
    }
    if (cursor < words.length) lines.push(words.slice(cursor).join(' '))
    return lines
  }
  return [at(5), at(3), at(3, 2)]
}

/** Outline of a heart, for the frame where WebGL never starts. */
function heartOutline() {
  const points: string[] = []
  let left = Infinity
  let right = -Infinity
  let top = Infinity
  let bottom = -Infinity
  for (let i = 0; i <= 128; i += 1) {
    const t = (i / 128) * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    left = Math.min(left, x)
    right = Math.max(right, x)
    top = Math.min(top, y)
    bottom = Math.max(bottom, y)
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return { d: `${points.join(' ')} Z`, top, bottom, halfWidth: Math.max(-left, right) }
}

const FALLBACK_NAME_SCALE = 0.84
/** The question is written smaller than the name, at the same ratio the particles use. */
const FALLBACK_QUESTION_RATIO = 0.6

/**
 * Stacks heart, name and question and derives the viewBox from where the ink actually lands.
 * A fixed viewBox clipped the last line of the question the moment a wide viewport made
 * `meet` scale to height, and fixed offsets left the block sitting off-centre.
 */
function fallbackFrame(name: string, questionLines: string[]) {
  const heart = heartOutline()
  const nameScript = composeScript([name], 'deferred')
  const questionScript = composeScript(questionLines, 'inline')
  const questionScale = FALLBACK_NAME_SCALE * FALLBACK_QUESTION_RATIO

  // Each block is centred on its own ink, so nothing rests on a hand-tuned nudge.
  const centre = (script: typeof nameScript, scale: number) =>
    -(script.bounds.x + script.bounds.width / 2) * scale
  const spanBottom = (script: typeof nameScript, y: number, scale: number) =>
    y + (script.bounds.y + script.bounds.height) * scale

  // One cap height of dark between the two thoughts, as the written frame keeps.
  const gap = nameScript.capHeight * FALLBACK_NAME_SCALE
  const nameY = heart.bottom + gap - nameScript.bounds.y * FALLBACK_NAME_SCALE
  const questionY =
    spanBottom(nameScript, nameY, FALLBACK_NAME_SCALE) +
    gap -
    questionScript.bounds.y * questionScale

  const halfWidth = Math.max(
    heart.halfWidth,
    (nameScript.bounds.width * FALLBACK_NAME_SCALE) / 2,
    (questionScript.bounds.width * questionScale) / 2,
  )
  const pad = gap * 0.7
  const bottom = spanBottom(questionScript, questionY, questionScale)

  return {
    heart: heart.d,
    nameScript,
    questionScript,
    nameTransform: `translate(${centre(nameScript, FALLBACK_NAME_SCALE).toFixed(2)} ${nameY.toFixed(2)}) scale(${FALLBACK_NAME_SCALE})`,
    questionTransform: `translate(${centre(questionScript, questionScale).toFixed(2)} ${questionY.toFixed(2)}) scale(${questionScale.toFixed(3)})`,
    viewBox: [
      -(halfWidth + pad),
      heart.top - pad,
      (halfWidth + pad) * 2,
      bottom - heart.top + pad * 2,
    ]
      .map((value) => value.toFixed(2))
      .join(' '),
  }
}

export function SceneHeart(props: SceneProps) {
  const ref = useRef<HTMLElement>(null)
  useSceneReveal(ref, props.active)

  const name = STORY_CONFIG.signatureName
  const question = STORY_CONFIG.final.invitation
  const splits = useMemo(() => questionSplits(question), [question])
  const fallback = useMemo(() => fallbackFrame(name, splits[splits.length - 1]), [name, splits])

  return (
    <SceneContainer ref={ref} {...props} tone="cosmic" className="scene-heart">
      <div className="heart-stage">
        <HeartWriting active={props.active} nameLines={[name]} questionSplits={splits} />
        <svg
          className="heart-fallback"
          viewBox={fallback.viewBox}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <g className="heart-fallback-shape">
            <path d={fallback.heart} />
          </g>
          <g className="heart-fallback-ink" transform={fallback.nameTransform}>
            {fallback.nameScript.strokes.map((stroke, index) => (
              <path key={`name-${index}`} d={stroke.d} />
            ))}
          </g>
          <g
            className="heart-fallback-ink heart-fallback-ink--quiet"
            transform={fallback.questionTransform}
          >
            {fallback.questionScript.strokes.map((stroke, index) => (
              <path key={`question-${index}`} d={stroke.d} />
            ))}
          </g>
        </svg>
      </div>
      {/* The lines are drawn out of particles; assistive technology gets them as real text,
          with her name spelled the way it is spelled. */}
      <p className="sr-only">{name}</p>
      <p className="sr-only">{question}</p>
    </SceneContainer>
  )
}
