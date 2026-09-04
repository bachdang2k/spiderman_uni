import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SceneContainer } from '../../components/SceneContainer'
import { SceneProgress } from '../../components/SceneProgress'
import { StarField } from '../../components/StarField'
import { StarInvitation } from '../../components/StarInvitation'
import { STORY_CONFIG } from '../../config/story'
import type { SceneProps } from '../types'

export function SceneFinal(props: SceneProps) {
  const [answered, setAnswered] = useState(false)
  const answer = () => {
    setAnswered(true)
    props.playSound('reveal')
  }
  return (
    <SceneContainer {...props} className={`scene-final-invite ${answered ? 'sunset-open' : ''}`}>
      <SceneProgress index={7} total={8} />
      <StarField dense />
      <div className="sunset-orb" aria-hidden="true" />
      <StarInvitation />
      <button className="sunset-answer" onClick={answer} data-cursor="action">
        {STORY_CONFIG.final.answer}
      </button>
      <AnimatePresence>
        {answered && (
          <motion.p
            className="sunset-after"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {STORY_CONFIG.final.after}
          </motion.p>
        )}
      </AnimatePresence>
    </SceneContainer>
  )
}
