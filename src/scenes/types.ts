import type { SceneId } from '../config/story'
export type SceneProps = {
  id: SceneId
  index: number
  active: boolean
  onComplete: () => void
  playSound: (name: 'click' | 'thwip' | 'bloom' | 'cosmic' | 'reveal') => void
}
